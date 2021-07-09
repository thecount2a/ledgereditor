<template>
    <div>
        <v-navigation-drawer app v-model="draweropen">
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        Editor Settings
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-switch
                v-model="shownontransaction"
                label="Show Non-Transactions"
            ></v-switch>
            <v-switch
                v-model="showcodeinsteadofstatus"
                label="Show Code Instead of Status"
            ></v-switch>
            <v-switch
                v-model="alwaysshowcomments"
                label="Always Show Comments"
            ></v-switch>
            <v-select label="Only Enable Editing" v-model="onlyenable" multiple :items="['Date', 'Status', 'Code', 'Description', 'Comment', 'Amount', 'Account', 'Second Account']">
            </v-select>


            <v-divider class="mt-3 mb-3"></v-divider>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        Transaction Filters
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-combobox v-model="searchFirstAccount" :items="accounts" label="Filter by First Account" clearable></v-combobox>
            <v-select label="Search Type" v-model="searchType" :items="['All Fields', 'Date', 'Status', 'Code', 'Description', 'Comment', 'Amount', 'Any Account', 'First Account', 'Second Account']">
            </v-select>
            <v-switch
                v-model="caseSensitive"
                label="Case Sensitive"
            ></v-switch>
            <v-text-field clearable label="Search Text" v-model="searchStringRaw" :loading="searchStringLoading"></v-text-field>
            <v-row class="mt-4" justify="center">
                <v-date-picker
                    v-model="months"
                    type="month"
                    multiple
                ></v-date-picker>
            </v-row>
        </v-navigation-drawer>
        <v-app-bar
            color="white"
            elevate-on-scroll
            app
        >
            <v-app-bar-nav-icon @click.stop="draweropen = !draweropen"></v-app-bar-nav-icon>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        color="primary"
                        dark
                        fab
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon dark>
                            mdi-plus
                        </v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="addTransactionBlock"><v-list-item-title>Add Transaction Block</v-list-item-title></v-list-item>
                    <v-list-item @click="addCommentBlock"><v-list-item-title>Add Comment</v-list-item-title></v-list-item>
                    <v-list-item @click="addOtherBlock"><v-list-item-title>Add Generic Block</v-list-item-title></v-list-item>
                </v-list>
            </v-menu>
            <v-spacer></v-spacer>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="loadSampleLedger"><v-list-item-title>Load Sample Ledger</v-list-item-title></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>
        <v-main>
            <v-container>
                <v-expansion-panels v-model="textLedgerOpen" class="mb-9">
                    <v-expansion-panel>
                        <v-expansion-panel-header>Text-based Ledger</v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-textarea v-model="textLedger" label="Text Ledger" @change="textLedgerChanged" rows="10" filled></v-textarea>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <LedgerBlock v-for="lblock in sortedLedger" v-bind:key="lblock.id" v-bind:lblock="lblock" v-bind:alwaysshowcomments="alwaysshowcomments" v-bind:accounts="accounts" v-bind:onlyenable="onlyenable" v-bind:showcodeinsteadofstatus="showcodeinsteadofstatus"></LedgerBlock>
            </v-container>
        </v-main>
    </div>
</template>

<script>
    import { toLedger, fromLedger } from "@/ledgerparser2";
    import { sampleLedger } from "@/sampleledger";
    import LedgerBlock from '@/components/LedgerBlock'

export default {
        name: 'LedgerEditor',

        filters: {
            filterBlocks: function(blockList, months, shownontransaction, searchMatches, searchFirstAccount, searchType, searchString, caseSensitive, moment) {
                let filteredList = [];
                let momentMonths = [];
                for (var j = 0; j < months.length; j++)
                {
                    momentMonths.push(moment(months[j], 'YYYY-MM'));
                }
                for (var i = 0; i < blockList.length; i++)
                {
                    if (blockList[i].type=="transaction")
                    {
                        if (momentMonths.length <= 0)
                        {
                            if (searchMatches(blockList[i], searchFirstAccount, searchType, searchString, caseSensitive))
                            {
                                filteredList.push(blockList[i]);
                            }
                        }
                        else
                        {
                            let thisDate = moment(blockList[i].date, 'YYYY-MM-DD');
                            for (var j = 0; j < momentMonths.length; j++)
                            {
                                if (thisDate.year() == momentMonths[j].year() && thisDate.month() == momentMonths[j].month())
                                {
                                    if (searchMatches(blockList[i], searchFirstAccount, searchType, searchString, caseSensitive))
                                    {
                                        filteredList.push(blockList[i]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    else if (shownontransaction)
                    {
                        if (searchMatches(blockList[i], searchFirstAccount, searchType, searchString, caseSensitive))
                        {
                            filteredList.push(blockList[i]);
                        }
                    }
                }
                return filteredList;
            }
        },

        computed: {
            sortedLedger: function() {
                return this.$options.filters.filterBlocks(this.ledger, this.months, this.shownontransaction, this.searchMatches, this.searchFirstAccount, this.searchType, this.searchString, this.caseSensitive, this.$moment);
            },
            searchStringRaw: {
                get() {
                    return this.searchString;
                },
                set(val) {
                    this.searchStringLoading = true;
                    if (this.searchStringTimeout)
                    {
                        clearTimeout(this.searchStringTimeout);
                    }
                    this.searchStringTimeout = setTimeout(() => {
                        this.searchStringLoading = false;
                        this.searchString = val;
                    }, 750);
                }
            }
        },

		// app initial state
		data:  function () {
            return {
			    ledger: [],
                textLedger: "",
                months: [this.$moment().format('YYYY-MM'), this.$moment().subtract(1, 'months').format('YYYY-MM'), this.$moment().subtract(2, 'months').format('YYYY-MM')],
                draweropen: null,
                shownontransaction: true,
                showcodeinsteadofstatus: false,
                alwaysshowcomments: false,
                accounts: [],
                onlyenable: [],
                textLedgerOpen: 0,
                searchType: "All Fields",
                searchString: "",
                caseSensitive: false,
                searchFirstAccount: "",
                searchStringTimeout: null,
                searchStringLoading: false
            }
		},
        components: { 
            LedgerBlock 
        },

		// watch ledger change flushing to textarea
        watch: {
			ledger: {
				deep: true,
				handler: function (ob) {
                    if (this.textLedgerOpen === 0) {
                        this.updateTextLedger();
                    }
                }
            },
            textLedgerOpen: {
                handler: function(ob) {
                    if (this.textLedgerOpen === 0) {
                        this.updateTextLedger();
                    }
                }
            }
        },

		// methods that implement data logic.
		// note there's no DOM manipulation here at all.
        methods: {
            searchMatches: function(block, searchFirstAccount, searchType, searchString, caseSensitive) {
                /* Sometimes this ends up as "null" if the clear button is used. Deal with it. */
                if (!searchString)
                {
                    searchString = "";
                }
                if (!caseSensitive)
                {
                    searchString = searchString.toLocaleLowerCase();
                }
                /* Omit checking for "All Fields" since that will be handled by the "Any Account" block below */
                if (searchFirstAccount || searchType == "First Account")
                {
                    if ((block.type == "transaction" || block.type == "other") && block.postingIndexes.length > 0)
                    {
                        if (searchFirstAccount && block.lines[block.postingIndexes[0]].account != searchFirstAccount)
                        {
                            // searchFirstAccount is considered an "AND" operation. If it fails, return false.
                            return false;
                        }
                        if (searchType == "First Account")
                        {
                            if (caseSensitive)
                            {
                                if (block.lines[block.postingIndexes[0]].account.indexOf(searchString) >= 0)
                                {
                                    return true;
                                }
                            }
                            else
                            {
                                if (block.lines[block.postingIndexes[0]].account.toLocaleLowerCase().indexOf(searchString) >= 0)
                                {
                                    return true;
                                }
                            }
                        }
                    }
                    else if (searchFirstAccount)
                    {
                        /* If we are using searchFirstAccount and this is not a transaction or the transaction has no postings, return false */
                        return false;
                    }
                }
                if (searchType == "All Fields" && !searchString)
                {
                    return true;
                }
                /* Omit checking for "All Fields" since that will be handled by the "Any Account" block below */
                if (searchType == "Second Account")
                {
                    if ((block.type == "transaction" || block.type == "other") && block.postingIndexes.length > 0)
                    {
                        if (caseSensitive && block.lines[block.postingIndexes[1]].account.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.lines[block.postingIndexes[1]].account.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Any Account" || searchType == "All Fields")
                {
                    if (block.type == "transaction" || block.type == "other")
                    {
                        for (var i = 0; i < block.postingIndexes.length; i++)
                        {
                            if (caseSensitive && block.lines[block.postingIndexes[i]].account.indexOf(searchString) >= 0)
                            {
                                return true;
                            }
                            else if (!caseSensitive && block.lines[block.postingIndexes[i]].account.toLocaleLowerCase().indexOf(searchString) >= 0)
                            {
                                return true;
                            }
                        }
                    }
                }
                if (searchType == "Date" || searchType == "All Fields")
                {
                    if (block.type == "transaction")
                    {
                        if (caseSensitive && block.date.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.date.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Status" || searchType == "All Fields")
                {
                    if (block.type == "transaction")
                    {
                        if (block.status == searchString)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Code" || searchType == "All Fields")
                {
                    if (block.type == "transaction")
                    {
                        if (caseSensitive && block.code.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.code.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Description" || searchType == "All Fields")
                {
                    if (block.type == "transaction")
                    {
                        if (caseSensitive && block.description.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.description.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Comment" || searchType == "All Fields")
                {
                    if (block.type == "transaction")
                    {
                        if (caseSensitive && block.comment.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.comment.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                    if (block.type == "transaction" || block.type == "other")
                    {
                        for (var i = 0; i < block.lines.length; i++)
                        {
                            let testString = "";
                            if (block.lines[i].type == "posting")
                            {
                                testString = block.lines[i].comment;
                            }
                            else if (block.lines[i].type == "comment")
                            {
                                testString = block.lines[i].text;
                            }
                            if (caseSensitive && testString.indexOf(searchString) >= 0)
                            {
                                return true;
                            }
                            else if (!caseSensitive && testString.toLocaleLowerCase().indexOf(searchString) >= 0)
                            {
                                return true;
                            }
                        }
                    }
                    else if (block.type == "comment")
                    {
                        if (caseSensitive && block.text.indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                        else if (!caseSensitive && block.text.toLocaleLowerCase().indexOf(searchString) >= 0)
                        {
                            return true;
                        }
                    }
                }
                if (searchType == "Amount" || searchType == "All Fields")
                {
                    if (block.type == "transaction" || block.type == "other")
                    {
                        for (var i = 0; i < block.lines.length; i++)
                        {
                            if (block.lines[i].type == "posting")
                            {
                                if (caseSensitive && block.lines[i].amount.indexOf(searchString) >= 0)
                                {
                                    return true;
                                }
                                else if (!caseSensitive && block.lines[i].amount.toLocaleLowerCase().indexOf(searchString) >= 0)
                                {
                                    return true;
                                }
                            }
                        }
                    }
                }
                return false;
            },
            updateTextLedger: function() {
                this.textLedger = toLedger({blocks: this.ledger});
                let newLedger = fromLedger(this.textLedger);
                this.accounts = newLedger.accounts;
            },
            scrollToBottom: function() {
                window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
            },
			addTransactionBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "transaction", lines: [], postingIndexes: [], date: this.$moment().format('YYYY-MM-DD'), status: "", code: "", description: "", comment: "", code: ""});
                setTimeout(this.scrollToBottom, 10); // Scroll after slight delay so that the scrolling happens after the GUI has added the new elements
			},
			addCommentBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "comment", text: "", commentType: ";"});
                setTimeout(this.scrollToBottom, 10); // Scroll after slight delay so that the scrolling happens after the GUI has added the new elements
			},
			addOtherBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "other", text: "<Replace this with ledger entry>", lines:[], postingIndexes: []});
                setTimeout(this.scrollToBottom, 10); // Scroll after slight delay so that the scrolling happens after the GUI has added the new elements
			},
            textLedgerChanged: function() {
                let newLedger = fromLedger(this.textLedger);
                for (var i = 0; i < newLedger.blocks.length; i++)
                {
                    newLedger.blocks[i].id = i;
                }
                this.ledger = newLedger.blocks;
                this.accounts = newLedger.accounts;
            },
            loadSampleLedger: function() {
                this.textLedger = sampleLedger;
                this.textLedgerChanged();
            }
		},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
