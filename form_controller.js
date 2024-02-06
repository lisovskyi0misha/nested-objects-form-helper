import { Controller } from "@hotwired/stimulus"
import axios from 'axios';

const formFieldPrefix = 'item';
const sizeFieldsPrefix = 'size';

export default class extends Controller {
  static targets = [ 'emptySizeFieds', 'sizeFieldsContainer', 'form', 'error' ];

  addSizeFields() {
    let fields = this.emptySizeFiedsTarget.cloneNode(true)
    fields.classList.remove('not-displayed')
    fields.removeAttribute('data-items-form-target');
    this.sizeFieldsContainerTarget.appendChild(fields)
  }

  handleSubmitForm(event) {
    event.preventDefault()
    let params = this.buildFormParams()
    
    axios.patch('/items/5', {
      ...params,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(({ data: { id }}) => {
        window.location.href = `/items/${id}`
    }, ({ response: { data, status } }) => {
      if (status === 422) {
        this.handleErrors(data.errors)
      }
    })
  }

  buildFormParams() {
    let data = new FormData(this.formTarget);
    let params = {item: {sizes_attributes: []}};
    let sizeParams = []
    data.forEach((value, attribute) => {
      if (attribute.includes('item')) {
        this.buildItemParams({params, attribute, value, sizeParams})
      } else {
        params[attribute] = value
      }
    })
    this.buildSizeParams({ sizeParams, params })

    return params
  }

  buildItemParams({params, attribute, value, sizeParams}) {
    if (attribute.includes('size')) {
      sizeParams.push({ value, attribute })
    } else {
      let attr = attribute.replace(formFieldPrefix, '').replace(/[^a-zA-Z0-9_ ]/g, '')
      params['item'][attr] = value 
    }

  }

  buildSizeParams({ sizeParams, params }) {
    let ind = 0;
    sizeParams.forEach(() => {
      if (ind % 2 === 0 && sizeParams[ind].value !== '') {
        let attr1 = this.cleanSizeAttribute(sizeParams[ind].attribute)
        let attr2 = this.cleanSizeAttribute(sizeParams[ind + 1].attribute)
        params['item']['sizes_attributes'].push({[attr1]: sizeParams[ind].value, [attr2]: sizeParams[ind + 1].value})
      }
      ind += 1;
    })
  }

  handleErrors(errors) {
    console.log(errors);

    this.errorTargets.forEach((message) => {
      let attribute = message.dataset.attribute;
      if (errors[attribute]) {
        message.textContent = errors[attribute]
        message.classList.remove('not-displayed')
      }
    })

  }

  cleanSizeAttribute(attribute) {
    return attribute.replace(formFieldPrefix, '').replace(sizeFieldsPrefix, '').replace(/[^a-zA-Z0-9_ ]/g, '')
  }
}
