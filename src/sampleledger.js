const sampleLedger = `; A sample journal file.
;
; Sets up this account tree:
; assets
;   bank
;     checking
;     saving
;   cash
; expenses
;   food
;   supplies
; income
;   gifts
;   salary
; liabilities
;   debts

; declare accounts:
; account assets:bank:checking
; account income:salary
; account income:gifts
; account assets:bank:saving
; account assets:cash
; account expenses:food
; account expenses:supplies
; account liabilities:debts

; declare commodities:
; commodity $

2021/01/01 income
    assets:bank:checking  $1
    income:salary

2021/06/01 gift
    assets:bank:checking  $1
    income:gifts

2021/06/02 save
    assets:bank:saving  $1
    assets:bank:checking

2021/06/03 * eat & shop
    expenses:food      $1
    expenses:supplies  $1
    assets:cash

2021/07/31 * pay off
    liabilities:debts  $1
    assets:bank:checking


;final comment
`;
export { sampleLedger };
