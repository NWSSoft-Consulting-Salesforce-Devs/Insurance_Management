import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from 'lightning/uiRecordApi';
import createOrderRecord from '@salesforce/apex/RestaurantUtility.createOrderRecord';

export default class CheckoutForRestaurant extends NavigationMixin(LightningElement) {
    orderId;
    customerName;
    customerPhone;
    @track instructions;
    @track showLoading = false;
    @track showPopup = false;
    currentMenuItem;
    @track orderDetailsArray=[];
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentMenuItem = currentPageReference.state?.currentParent;
        console.log('first parameter is '+this.currentMenuItem);
        this.orderDetailsArray = JSON.parse(currentPageReference.state?.allItems);
        console.log('second parameter is '+JSON.stringify(this.orderDetailsArray));
    }

    backButtonOnClick(){
        if(this.currentMenuItem){
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'ChildItems__c'
                },
                state: {
                    itemName: this.currentMenuItem
                }
            });
        }
    }
    minusOnClick(event){
        var idChecking = this.orderDetailsArray.find(e=>
            e.id === event.currentTarget.dataset.id
        );
        if(idChecking){
            this.orderDetailsArray.forEach((e, index)=>{
                if(e === idChecking){
                    if(e.count > 1){
                        e.count --;
                        e.totalPrice = e.count * e.price;
                    }else if(e.count === 1){
                        this.orderDetailsArray.splice(index, 1);
                    }
                }
            });
            sessionStorage.setItem('orderDetails', JSON.stringify(this.orderDetailsArray));
        }
    }
    plusOnClick(event){
        let idChecking = this.orderDetailsArray.find(e=>
            e.id === event.currentTarget.dataset.id
            );
        if(idChecking){
            this.orderDetailsArray.forEach((e, index) =>{
                if(e === idChecking){
                    if(e.count >= 1){
                        e.count ++;
                        e.totalPrice = e.count * e.price;                        
                    }
                }
            });
            sessionStorage.setItem('orderDetails', JSON.stringify(this.orderDetailsArray));
        }
    }
    handleOnDelete(event){
        this.orderDetailsArray.forEach((e,index)=>{
            if(e.id === event.currentTarget.dataset.id){
                this.orderDetailsArray.splice(index, 1);
            }
        });
        sessionStorage.setItem('orderDetails', JSON.stringify(this.orderDetailsArray));
    }
    handleAddMoreItems(){
        this.backButtonOnClick();
    }
    get showOrderedDetails(){
        return this.orderDetailsArray.length > 0 ? true : false;
    }
    get totalAmount(){
        let totalPrice=0;
        this.orderDetailsArray.forEach(e =>{
            totalPrice += (e.price * e.count);
        });
        console.log('total amount is '+totalPrice);
        return totalPrice;
    }
    get GstAmount(){
        return parseInt(this.totalAmount) * 5/100;
    }
    get toPayAmount(){
        return this.totalAmount + this.GstAmount;
    }
    get showCount(){
        let totalCount = 0;
        this.orderDetailsArray.forEach(e =>{
            totalCount += e.count;
        });
        console.log('total count is '+totalCount);
        return totalCount;
    }
    handleInputOnchange(event){
        this.instructions = event.target.value;
    }
    handleconfirmorder(){
        this.showPopup = true;
    }
    hideModalBox(){
        this.showPopup = false;
        this.customerName= '';
        this.customerPhone= '';
    }
    handleInput(event){
        const eventName = event.target.name;
        if(eventName === 'name'){
            this.customerName = event.target.value;
        }else{
            this.customerPhone = event.target.value;
        }
    }
    handlePopupConfirmOnClick(){
        let orderString = '';
        for (let record of this.orderDetailsArray){
            orderString += " "+record.name+ " : "+record.count+ ",";
        }
        console.log('orderr string is '+orderString);
        createOrderRecord({orderDetails : orderString, count : this.showCount,  amount : this.toPayAmount, instructions : this.instructions, customerName : this.customerName, customerPhone : this.customerPhone}).then(result=>{
            console.log('response is '+JSON.stringify(result));
            this.orderId = result.Name;

                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'success__c'
                    },
                    state: {
                        orderId: this.orderId
                    }
                });
        })
        .catch(error=>{
            console.log('error occured '+error);
        })
        /*const fields ={
            "Total_Amount__c": this.toPayAmount,
            "Total_Count__c": this.showCount,
            "Order_Details__c" : orderString,
            "Cooking_Instructions__c" : this.instructions,
            "Customer_Name__c" : this.customerName,
            "Phone__c" : this.customerPhone
        };
        const recordInput = {apiName: 'Order__c', fields};
        createRecord(recordInput)
            .then(result => {
                console.log('Response is '+JSON.stringify(result));
                // this.orderId = result;

                // this[NavigationMixin.Navigate]({
                //     type: 'comm__namedPage',
                //     attributes: {
                //         name: 'success__c'
                //     },
                //     state: {
                //         orderId: this.orderId
                //     }
                // });
            })
            .catch(error => {
                console.log('error occuredddd '+JSON.stringify(error));
            });*/
    }
    get enableLogin(){
        return this.customerName && this.customerPhone;
    }
}