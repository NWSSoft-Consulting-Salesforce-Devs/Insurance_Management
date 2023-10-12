import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getChildMenuItems from '@salesforce/apex/RestaurantUtility.getChildMenuItems';
import { NavigationMixin } from 'lightning/navigation';

export default class ChildItemsForRestaurant extends NavigationMixin(LightningElement) {
    @track addedItemArray=[];
    clickImage=false;
    @track firstRecord={};
    @track secondRecord={};
    @track thirdRecord={};
    @track fourthRecord={};
    @track fifthRecord={};

    
    @track currentContextItem;
    @track childMenuItems;
    @track parameter;
    showFirst = true;
    showSecond= true;
    showThird= true;
    showFourth= true;
    showFifth= true;
    getValueforOne = 1;
    getValueForTwo = 1;
    getValueForThree = 1;
    getValueForFour = 1;
    getValueForFive = 1;


    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.parameter=currentPageReference.state?.itemName;
        console.log('parameter is '+this.parameter);
    }
    @wire(getChildMenuItems,{itemName : '$parameter'})
    response({data, error}){
        if(data){
            this.childMenuItems = data;
            this.firstRecord = this.childMenuItems[0];
            console.log('first record data is '+JSON.stringify(this.firstRecord.Name));
            this.secondRecord = this.childMenuItems[1];
            this.thirdRecord = this.childMenuItems[2];
            this.fourthRecord = this.childMenuItems[3];
            this.fifthRecord = this.childMenuItems[4];
        }else if(error){
            this.childMenuItems = undefined;
            console.log('error occured '+error);
        }
    }
    connectedCallback(){
       let sessionData =JSON.parse(sessionStorage.getItem('orderDetails'));
       if(sessionData){
            this.addedItemArray = sessionData;
            console.log('after reloading then array is '+JSON.stringify(this.addedItemArray));
            this.addedItemArray.forEach(e=>{
                if(e.currentEventName === 'firstName' && e.parentId === this.parameter){
                    this.showFirst = false;
                    this.getValueforOne = e.count;
                }else if(e.currentEventName === 'secondName' && e.parentId === this.parameter){
                    this.showSecond = false;
                    this.getValueForTwo = e.count;
                }else if(e.currentEventName === 'thirdName' && e.parentId === this.parameter){
                    this.showThird = false;
                    this.getValueForThree = e.count;
                }else if(e.currentEventName === 'fourthName' && e.parentId === this.parameter){
                    this.showFourth = false;
                    this.getValueForFour = e.count;
                }else if(e.currentEventName === 'fifthName' && e.parentId === this.parameter){
                    this.showFifth = false;
                    this.getValueForFive = e.count;
                }
            });
       }
    }
    backButtonOnClick(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
    }
    handleAddOnClick(event){
        let currentItem = this.childMenuItems.find(e=>
            e.Id === event.currentTarget.dataset.id
        );
        console.log('current record id is '+JSON.stringify(currentItem));
        let orderDetails = new Object();
        orderDetails.id = currentItem.Id;
        orderDetails.name = currentItem.Name;
        orderDetails.price = currentItem.Price__c;
        orderDetails.count = 1;
        orderDetails.totalPrice = orderDetails.price * orderDetails.count;
        orderDetails.currentEventName = event.target.name;
        orderDetails.parentId = currentItem.Parent_Item__c;

        this.addedItemArray.push(orderDetails);
        //store in session storage.
        sessionStorage.setItem('orderDetails', JSON.stringify(this.addedItemArray));
        
        console.log('get session data is '+ sessionStorage.getItem('orderDetails'));

        console.log('after add check the count value '+JSON.stringify(this.addedItemArray));

        let eventName = event.target.name;
        if(eventName === 'firstName'){
            this.showFirst=false;
        }else if(eventName === 'secondName'){
            this.showSecond=false;
        }else if(eventName === 'thirdName'){
            this.showThird=false;
        }else if(eventName === 'fourthName'){
            this.showFourth=false;
        }else if(eventName === 'fifthName'){
            this.showFifth=false;
        }
    }
    handleMenuItemOnClick(event){
        this.currentContextItem = this.childMenuItems.find(e=>
            e.Id === event.currentTarget.dataset.id
        );
        console.log('current context record details '+JSON.stringify(this.currentContextItem));
        this.clickImage=true;
    }
    hideModalBox(){
        this.clickImage=false;
    }
    minusOnClick(event){
        let idChecking = this.addedItemArray.find(e=>
            e.id === event.currentTarget.dataset.id
            );
        if(idChecking){
            this.addedItemArray.forEach((e, index) =>{
                if(e === idChecking){
                    if(e.count > 1){
                        e.count --;
                        e.totalPrice = e.count * e.price;
                        console.log('after minus check the count value '+JSON.stringify(this.addedItemArray));
                        this.reuseableCode(event.target.name, e.count);
                    }
                    else if(e.count === 1){
                        this.addedItemArray.splice(index, 1);

                        console.log('after minus check the count value '+JSON.stringify(this.addedItemArray));

                        let eventName = event.target.name;
                        if(eventName === 'firstName'){
                            this.showFirst=true;
                        }else if(eventName === 'secondName'){
                            this.showSecond=true;
                        }else if(eventName === 'thirdName'){
                            this.showThird=true;
                        }else if(eventName === 'fourthName'){
                            this.showFourth=true;
                        }else if(eventName === 'fifthName'){
                            this.showFifth=true;
                        }
                    }
                }
            });
            sessionStorage.setItem('orderDetails', JSON.stringify(this.addedItemArray));
        }
    }
    plusOnClick(event){
        let idChecking = this.addedItemArray.find(e=>
            e.id === event.currentTarget.dataset.id
            );
        if(idChecking){
            this.addedItemArray.forEach((e, index) =>{
                if(e === idChecking){
                    if(e.count >= 1){
                        e.count ++;
                        e.totalPrice = e.count * e.price;
                        console.log('after plus check the count value '+JSON.stringify(this.addedItemArray));
                        this.reuseableCode(event.target.name, e.count);
                    }
                }
            });
            sessionStorage.setItem('orderDetails', JSON.stringify(this.addedItemArray));
        }
    }
    get showViewCart(){
        return this.addedItemArray.length > 0 ? true : false;
    }
    get showCount(){
        let totalCount = 0;
        this.addedItemArray.forEach(e =>{
            totalCount += e.count;
        });
        console.log('total count is '+totalCount);
        return totalCount;
    }
    get showAmount(){
        let totalAmount=0;
        this.addedItemArray.forEach(e =>{
           totalAmount += (e.price * e.count);
        });
        console.log('total amount is '+totalAmount);
        return totalAmount;
    }
    handleViewCart(){
        //sessionStorage.setItem('currentParent', this.parameter);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'checkout__c'
            },
            state: {
                currentParent: this.parameter,
                allItems: JSON.stringify(this.addedItemArray)
            } 
        });
    }
    reuseableCode(eventName, ecount){
        if(eventName === 'firstName'){
            this.getValueforOne = ecount;
        }else if(eventName === 'secondName'){
            this.getValueForTwo = ecount;
        }else if(eventName === 'thirdName'){
            this.getValueForThree = ecount;
        }else if(eventName === 'fourthName'){
            this.getValueForFour = ecount;
        }else if(eventName === 'fifthName'){
            this.getValueForFive = ecount;
        }
    }


}