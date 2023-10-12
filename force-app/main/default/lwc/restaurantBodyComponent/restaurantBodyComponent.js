import { LightningElement, track, wire } from 'lwc';
import getMenuItems from '@salesforce/apex/RestaurantUtility.getMenuItems';
import { NavigationMixin } from 'lightning/navigation';

export default class RestaurantBodyComponent extends NavigationMixin(LightningElement) {
    @track menuItems;
    @track initialRecords;
    @track error;

    @wire(getMenuItems)
    response({data, error}){
        if(data){
            this.menuItems = data;
            this.initialRecords = data;
            this.error = undefined;
        }else if(error){
            this.error = error;
            this.menuItems = undefined;
            console.log('error occured '+error);
        }
    }
    handleSearchOnChange(event){
        const searchKey = event.target.value.toLowerCase();
 
        if (searchKey)
        {
            this.menuItems = this.initialRecords;
 
            if (this.menuItems)
            {
                let searchRecords = [];
 
                for (let record of this.menuItems)
                {
                    let valuesArray = Object.values(record);
 
                    for (let val of valuesArray)
                    {
                        let strVal = String(val);
 
                        if (strVal)
                        {
 
                            if (strVal.toLowerCase().includes(searchKey))
                            {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
 
                console.log('Matched Accounts are ' + JSON.stringify(searchRecords));
                this.menuItems = searchRecords;
            }
        }
        else
        {
            this.menuItems = this.initialRecords;
        }
    }
    handleMenuOnClick(event){
        let itemName = event.currentTarget.dataset.name;
        console.log('selected item name is '+itemName);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'ChildItems__c'
            },
            state: {
                itemName: itemName
            } 
        });
    }
}