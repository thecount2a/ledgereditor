<template>
    <v-card v-if="(lblock.type == 'other' && lblock.text != '') || lblock.type != 'other'">
            <v-container>
                <v-row no-gutters>
                    <v-col cols="1" v-if="lblock.type == 'transaction'">
                        <v-menu
                            v-model="datemenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    
                                    v-model="lblock.date"
                                    label="Transaction Date"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    filled
                                    hide-details="auto"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="lblock.date"
                                @input="datemenu = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="1" v-if="lblock.type == 'transaction'">
                        <v-select hide-details="auto" filled v-model="lblock.status" :items="['', '!', '*']" label="Status"></v-select>
                    </v-col>
                    <v-col :cols="(open || alwaysshowcomments) ? 4 : 2" v-if="lblock.type == 'transaction'">
                        <v-text-field hide-details="auto" filled label="Description" v-model="lblock.description"></v-text-field>
                    </v-col>
                    <v-col cols="6" v-if="(open || alwaysshowcomments) && lblock.type == 'transaction'">
                        <v-text-field hide-details="auto" filled label="Comment" v-model="lblock.comment"></v-text-field>
                    </v-col>
                    <v-col :cols="open || (lblock.type =='other' && lblock.postingIndexes.length <=0) ? 12 : 4" v-if="lblock.type == 'other'">
                        <v-textarea hide-details="auto" filled auto-grow label="Generic Ledger Block" rows="1" v-model="lblock.text"></v-textarea>
                    </v-col>
                    <v-col cols="12" v-if="lblock.type == 'comment'">
                        <v-textarea hide-details="auto" filled auto-grow label="Comment Block" rows="3" v-model="lblock.text"></v-textarea>
                    </v-col>
                    <v-col v-if="(lblock.type == 'transaction' && !open && alwaysshowcomments)" cols="4">&nbsp;</v-col>
                    <v-col cols="3" v-if="!open && lblock.type != 'comment' && (lblock.postingIndexes.length > 0 || lblock.type =='transaction')">
                        <v-combobox hide-details="auto" :filled="alwaysshowcomments?false:true" v-model="firstAccount" :items="accounts" label="First Account"></v-combobox>
                    </v-col>
                    <v-col cols="2" v-if="!open && lblock.type != 'comment' && (lblock.postingIndexes.length > 0 || lblock.type =='transaction')">
                        <v-text-field hide-details="auto" :filled="alwaysshowcomments?false:true" label="Amount" v-model="firstAmount">
                            <v-icon slot="prepend" :color="firstAmount.search('-')>=0?'red':'black'">
                                {{ firstAmount.search('-')>=0?'mdi-arrow-right-bold':'mdi-arrow-left-bold' }}
                            </v-icon>
                            <v-icon slot="append-outer" :color="firstAmount.search('-')>=0?'red':'black'">
                                {{ firstAmount.search('-')>=0?'mdi-arrow-right-bold':'mdi-arrow-left-bold' }}
                            </v-icon>
                        </v-text-field>
                    </v-col>
                    <v-col cols="3" v-if="!open && lblock.type != 'comment' && (lblock.postingIndexes.length > 0 || lblock.type =='transaction')">
                        <v-combobox hide-details="auto" :filled="alwaysshowcomments?false:true" v-model="secondAccount" :items="accounts" label="Second Account" :disabled="lblock.postingIndexes.length > 2"></v-combobox>
                    </v-col>
                </v-row>
                <v-row v-if="lblock.type != 'comment'" no-gutters>
                    <v-icon @click="open = !open">{{ open ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-row>
                <v-expand-transition v-if="(lblock.type == 'other' && lblock.text != '') || lblock.type == 'transaction'">
                    <div v-show="open">
                        <div v-for="lline in lblock.lines">
                            <v-row v-if="lline.type=='posting'" no-gutters>
                                <v-spacer></v-spacer>
                                <v-col cols="3">
                                    <v-combobox hide-details="auto" v-model="lline.account" :items="accounts" label="Account"></v-combobox>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field hide-details="auto" label="Amount" v-model="lline.amount"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field hide-details="auto" label="Comment" v-model="lline.comment"></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                </v-expand-transition>
            </v-container>
    </v-card>
</template>

<script>
export default {
    name: 'LedgerBlock',
    props: ['lblock', 'accounts', 'alwaysshowcomments'],
    data: function () {
        return {
            datemenu: false,
            open: false
        }
    },

    computed: {
        firstAccount: {
            get: function() {
                if (this.lblock.postingIndexes && this.lblock.postingIndexes.length > 0)
                {
                    return this.lblock.lines[this.lblock.postingIndexes[0]].account;
                }
                else
                {
                    return "";
                }
            },
            set: function(value) {
                if (this.lblock.postingIndexes.length <= 0)
                {
                    this.lblock.lines.push({type: "posting", account: "", amount: "", comment: "", status: ""});
                    this.lblock.postingIndexes.push(this.lblock.lines.length - 1);
                }
                this.lblock.lines[this.lblock.postingIndexes[0]].account = value;
            }
        },
        firstAmount: {
            get: function() {
                if (this.lblock.postingIndexes && this.lblock.postingIndexes.length > 0)
                {
                    return this.lblock.lines[this.lblock.postingIndexes[0]].amount;
                }
                else
                {
                    return "";
                }
            },
            set: function(value) {
                if (this.lblock.postingIndexes.length <= 0)
                {
                    this.lblock.lines.push({type: "posting", account: "", amount: "", comment: "", status: ""});
                    this.lblock.postingIndexes.push(this.lblock.lines.length - 1);
                }
                this.lblock.lines[this.lblock.postingIndexes[0]].amount = value;
            }
        },
        secondAccount: {
            get: function() {
                if (this.lblock.postingIndexes && this.lblock.postingIndexes.length > 2)
                {
                    return "--- Split ---";
                }
                else if (this.lblock.postingIndexes && this.lblock.postingIndexes.length > 1)
                {
                    return this.lblock.lines[this.lblock.postingIndexes[1]].account;
                }
                else
                {
                    return "";
                }
            },
            set: function(value) {
                if (this.lblock.postingIndexes.length <= 0)
                {
                    this.lblock.lines.push({type: "posting", account: "", amount: "", comment: "", status: ""});
                    this.lblock.postingIndexes.push(this.lblock.lines.length - 1);
                }
                if (this.lblock.postingIndexes.length <= 1)
                {
                    this.lblock.lines.push({type: "posting", account: "", amount: "", comment: "", status: ""});
                    this.lblock.postingIndexes.push(this.lblock.lines.length - 1);
                }
                if (this.lblock.postingIndexes.length == 2)
                {
                    this.lblock.lines[this.lblock.postingIndexes[1]].account = value;
                }
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .arrow-right-bold {
        color: red;
    }
</style>
