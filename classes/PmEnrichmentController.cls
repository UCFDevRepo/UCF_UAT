public class PmEnrichmentController {
// created by ussama
     @AuraEnabled(Cacheable = true)
    public static List<Account> getAccountList(){
        List<Account> accListObj= [SELECT Id, Name, Phone, Industry, Description, Type, Website FROM Account Where Phone != null limit 20 ];
        return accListObj;
    }


    // created by ussama
     @AuraEnabled(cacheable=true)
    public static List<String> getRatingPicklistValues() {
        List<String> picklistValues = new List<String>();
        Schema.DescribeFieldResult fieldResult = Account.Rating.getDescribe();
        
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            picklistValues.add(entry.getValue());
            //picklistValues.add(entry)
        }
        System.debug('test '+ picklistValues);
        
        return picklistValues;
    }

// created by ussama
      @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name, Industry, TickerSymbol,SicDesc,Rating FROM Account LIMIT 10];
    }

// created by ussama
    @AuraEnabled
public static String updateAccountFields(String recordId, String sicDesc, String tickerSymbol) {
    try {
        // Fetch the account record to update
        Account accToUpdate = [SELECT Id, SicDesc, TickerSymbol FROM Account WHERE Id = :recordId];

        // Update the fields
        accToUpdate.SicDesc = sicDesc;
        accToUpdate.TickerSymbol = tickerSymbol;

        // Update the record
        update accToUpdate;

        // Return a success message
        return 'Record updated successfully';
    } catch (Exception e) {
        throw new AuraHandledException('Error updating the account: ' + e.getMessage());
    }
}



// created by ussama
 @AuraEnabled 
    public static void updateAccountNew(Id accountId, String RatingToUpdate, String IndustryToUpdate) {
        System.debug('hello RatingToUpdate : ' + RatingToUpdate);
         System.debug('hello accountId : ' + accountId);
          System.debug('hello IndustryToUpdate : ' + IndustryToUpdate);
        Account accountToUpdate = new Account(Id = accountId);
        if(IndustryToUpdate != null && IndustryToUpdate != '')
        {
             System.debug('IndustryToUpdate' );
             accountToUpdate.Industry = IndustryToUpdate;
        }
           
         if(RatingToUpdate != null && RatingToUpdate != '')
             {
                   System.debug('RatingToUpdate' );
                    accountToUpdate.Rating = RatingToUpdate;
             }
         
        if(accountToUpdate!= null)
        {
            update accountToUpdate;
        }
        
    }

}