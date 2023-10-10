/*import { LightningElement, api, track, wire } from 'lwc'
import loadData from '@salesforce/apex/PmEnrichmentController.getAccountList';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [
    {
        label: 'Name',
        fieldName: 'Name',
        type: 'text',
        sortable: "true"
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true,
        sortable: "true"
    }, {
        label: 'Industry',
        fieldName: 'Industry',
        type: 'Picklist',
        editable: true,
        sortable: "true"
    }, {
        label: 'Type',
        fieldName: 'Type',
        type: 'text',
        editable: true,
        sortable: "true"
    }, {
        label: 'Description',
        fieldName: 'Type',
        type: 'text',
        editable: true
    }
    
];
export default class ServiceLocationLWC extends LightningElement {
    columns = columns;
    @track sortBy;
    @track sortDirection;
    @track recordList;
    draftValues = [];
 connectedCallback() {
       this.init();
    }
     init() {
        loadData({
         //   'recordId' : recordId
        }).then(result => {
            console.log('recordList..!', result);            
            this.recordList = result;
        }).catch(error => {
            this.showToast(error.body.message, 'error');
            console.log('error..!', error);
        });
    }


    showToast(msg, variant){
        const event = new ShowToastEvent({
            message: msg,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    saveHandleAction(event) {
        this.draftValues = event.detail.draftValues;
        const inputsItems = this.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });


       
        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.draftValues = [];
        });
    }
   
     async refresh() {
        await this.init();
    }

       handleSortAccountData(event) {       
        this.sortBy = event.detail.fieldName;       
        this.sortDirection = event.detail.sortDirection;       
        this.sortAccountData(event.detail.fieldName, event.detail.sortDirection);
    }
    sortAccountData(fieldname, direction) {
        
        let parseData = JSON.parse(JSON.stringify(this.recordList));
       
        let keyValue = (a) => {
            return a[fieldname];
        };
       let isReverse = direction === 'asc' ? 1: -1;


           parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
           
            return isReverse * ((x > y) - (y > x));
        });
        
        this.recordList = parseData;


    }
} */

import { LightningElement, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAccounts from '@salesforce/apex/PmEnrichmentController.getAccounts';
import updateAccountFields from '@salesforce/apex/PmEnrichmentController.updateAccountFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import getRatingPicklistValues from '@salesforce/apex/PmEnrichmentController.getRatingPicklistValues';


export default class ServiceLocationLWC extends LightningElement {
    @track accounts;
     @track data = [];
    @track draftValues = [];
    @track isModalOpen = false;
    @track sicDesc = '';
    @track tickerSymbol = '';
    @track ratingPicklistValues = [];
    @track sortField = 'Name'; // Default sort field
    @track sortDirection = 'asc'; // Default sort direction
    @track refreshTable = false; // Flag to trigger table refresh
    @track ratingPicklistOptions = [];
    @track selectedRating = ''; 

    error;

  @wire(getAccounts, { sortField: '$sortField', sortDirection: '$sortDirection', refreshTable: '$refreshTable' })
   // @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data.map(account => ({ ...account, editMode: true }));
            this.wiredPicklistValues;
        } else if (error) {
            this.error = error; 
        }
    }

    handleInputChange(event) {
        const recordId = event.target.dataset.recordId;
        const fieldName = event.target.dataset.fieldName;
        const newValue = event.target.value;

        const index = this.accounts.findIndex(account => account.Id === recordId);
        if (index !== -1) {
            this.accounts[index][fieldName] = newValue;
            this.draftValues.push({ Id: recordId, [fieldName]: newValue });
        }
    }

    
    // Handle column sorting
    sortByName() {
        this.sortDirection = this.sortField === 'Name' && this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortField = 'Name';
        this.sortData();
    }

    sortByIndustry() {

        this.sortDirection = this.sortField === 'Industry' && this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortField = 'Industry';
        this.sortData();
    }

    sortByRating() {
        this.sortDirection = this.sortField === 'Rating' && this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortField = 'Rating';
        this.sortData();
    }

    // Sort data array based on current sorting criteria
    sortData() {
        const field = this.sortField;
        const reverse = this.sortDirection === 'desc' ? -1 : 1;
        this.data = [...this.data.sort((a, b) => (a[field] > b[field] ? 1 : -1) * reverse)];
    }


  openModal(event) {
     
    const recordIdToEdit = event.currentTarget.dataset.recordId;
    const accountToEdit = this.accounts.find(account => account.Id === recordIdToEdit);
    // Set the values from the selected record
    this.recordIdToEdit = recordIdToEdit;

    console.log(recordIdToEdit);
    this.sicDesc = accountToEdit.SicDesc;
    this.tickerSymbol = accountToEdit.TickerSymbol;
    this.isModalOpen = true;
}
    
    @wire(getRatingPicklistValues)
wiredRatingPicklistValues({ error, data }) {
    if (data) {
        alert(JSON.stringify(data))
        this.ratingPicklistOptions = data;
    } else if (error) {
        console.error('Error loading Rating picklist values', error);
    }
}
/*
get ratingOptions() {
    return this.ratingPicklistOptions.map(option => ({
        label: option,
        value: option,
        selected: this.selectedRating === option // Compare with selectedRating
    }));
} */


    closeModal() {
        this.isModalOpen = false;
    }

    handleSicDescriptionChange(event) {
        this.sicDesc = event.target.value;
    }

    handleTickerSymbolChange(event) {
        this.tickerSymbol = event.target.value;
    }
    handleModalSave() {
    const fieldsToUpdate = {};
    fieldsToUpdate.Id = this.recordIdToEdit;
    fieldsToUpdate.sicDesc = this.sicDesc;
    fieldsToUpdate.TickerSymbol = this.tickerSymbol;

    updateAccountFields({ recordId: fieldsToUpdate.Id, sicDesc: fieldsToUpdate.sicDesc, tickerSymbol: fieldsToUpdate.TickerSymbol })
        .then(result => {
            // Close the modal
            this.isModalOpen = false;

            // Refresh the table or data
            return refreshApex(this.wiredAccounts)
                .then(() => {
                    // Display a success message
                    this.dispatchEvent(
                         new ShowToastEvent({
                title: 'Success',
                message: result, // This is the success message returned from Apex
                variant: 'success'
                        })
                    );
                });
        })
        .catch(error => {
            // Handle any errors and display an error message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                message: 'Error updating the record: ' + error.body.message,
                variant: 'error'
                })
            );
        });
}


    handleSave() {
       // alert('hello');
        const recordInputs = this.draftValues.map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));

        Promise.all(promises)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Records saved',
                        variant: 'success'
                    })
                );
                // Clear draft values and refresh data
                this.draftValues = [];
                return refreshApex(this.wiredAccounts);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}