global class BatchTop3 implements Database.Batchable <sObject>{   
    global BatchTop3()
    {
        
    }
    global Database.QueryLocator start(Database.BatchableContext info)
    {
        String SOQL = 'select Id from Top_Commercials__c';

        return Database.getQueryLocator(SOQL);
    }
    global void execute(Database.BatchableContext info, List<Top_Commercials__c> scope)
    {
        delete scope;
    }
    global void finish(Database.BatchableContext info)
    {
        system.debug('deleted');        
        Database.executeBatch(new batchTop3Child());

    }
    
}