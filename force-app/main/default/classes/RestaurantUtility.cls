public without sharing class RestaurantUtility
{
    @AuraEnabled(cacheable=true)
    public static list<Menu_Item__c> getMenuItems(){
        return [select Id, Name, Img__c,Description__c from Menu_Item__c where Parent_Item__c =null];        
    }
    //show the child items of selected menu item.
    @AuraEnabled(cacheable=true)
    public static list<Menu_Item__c> getChildMenuItems(string itemName){
        return [select Id, Name, Img__c, price__c,Description__c, Parent_Item__c from Menu_Item__c where Parent_Item__c =:itemName];        
    }
    //create order record
    @AuraEnabled()
    public static Order__c createOrderRecord(string orderDetails, integer count, decimal amount, string instructions, string customerName, string customerPhone){
        order__c ord = new order__c();
        ord.Total_Amount__c = amount;
        ord.Total_Count__c = count;
        ord.Order_Details__c = orderDetails;
        ord.Cooking_Instructions__c = instructions;
        ord.Customer_Name__c = customerName;
        ord.Phone__c = customerPhone;
        try{
            insert ord;
            return [select id, Name from order__c where Id =: ord.Id limit 1];
        }
        catch(exception e){
            system.debug('exception occured '+e.getMessage());
            return null;
        }
    }
    
}