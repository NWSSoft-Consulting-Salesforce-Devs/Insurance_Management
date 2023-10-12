import { LightningElement } from 'lwc';
import logo from '@salesforce/resourceUrl/ResImage';

export default class ImageComponent extends LightningElement {
    imageURL = logo;
}