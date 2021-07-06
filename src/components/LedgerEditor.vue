<template>
   <div>
     <v-navigation-drawer app v-model="draweropen">
         <v-checkbox
          v-model="shownontransaction"
          label="Show Non-Transactions"
        ></v-checkbox>
         <v-checkbox
          v-model="alwaysshowcomments"
          label="Always Show Comments"
        ></v-checkbox>
        <v-select v-model="onlyenable" multiple :items="['Date', 'Status', 'Description', 'Comment', 'Amount', 'Account', 'Account', 'Second Account']">
        </v-select>
           <v-row justify="center">
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
            <v-expansion-panels v-model="textLedgerOpen">
                <v-expansion-panel>
                    <v-expansion-panel-header>Text-based Ledger</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-textarea v-model="textLedger" label="Text Ledger" @change="textLedgerChanged" rows="10" filled></v-textarea>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <LedgerBlock v-for="lblock in sortedLedger" v-bind:key="lblock.id" v-bind:lblock="lblock" v-bind:alwaysshowcomments="alwaysshowcomments" v-bind:accounts="accounts" v-bind:onlyenable="onlyenable"></LedgerBlock>
        </v-card>
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
            filterBlocks: function(blockList, months, shownontransaction, moment) {
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
                            filteredList.push(blockList[i]);
                        }
                        else
                        {
                            let thisDate = moment(blockList[i].date, 'YYYY-MM-DD');
                            for (var j = 0; j < momentMonths.length; j++)
                            {
                                if (thisDate.year() == momentMonths[j].year() && thisDate.month() == momentMonths[j].month())
                                {
                                    filteredList.push(blockList[i]);
                                    break;
                                }
                            }
                        }
                    }
                    else if (shownontransaction)
                    {
                        filteredList.push(blockList[i]);
                    }
                }
                return filteredList;
            }
        },

        computed: {
            sortedLedger: function() {
                return this.$options.filters.filterBlocks(this.ledger, this.months, this.shownontransaction, this.$moment);
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
                alwaysshowcomments: false,
                accounts: [],
                onlyenable: [],
                textLedgerOpen: 0
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
            updateTextLedger: function() {
                this.textLedger = toLedger({blocks: this.ledger});
                let newLedger = fromLedger(this.textLedger);
                this.accounts = newLedger.accounts;
            },
			addTransactionBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "transaction", lines: [], postingIndexes: [], date: this.$moment().format('YYYY-MM-DD'), status: "", code: "", description: "", comment: "", code: ""});
			},
			addCommentBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "comment", text: "", commentType: ";"});
			},
			addOtherBlock: function () {
                let lastId = -1;
                if (this.ledger.length > 0)
                {
                    lastId = this.ledger[this.ledger.length - 1].id;
                }
				this.ledger.push({id: lastId + 1, type: "other", text: "<Replace this with ledger entry>", lines:[], postingIndexes: []});
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
