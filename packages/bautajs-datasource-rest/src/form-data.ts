/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import FormData from 'form-data';
import { Dictionary } from '@bautajs/core';

/**
 * Prepare the request to do a formData request
 * @param {Object} formData - form data object, could be a key, value object with nodejs streams, strings...
 * @returns {FormData} A nodejs form-data lib instance
 * @ignore
 * @example
 * const formdata = request.buildForm({
 *    // Pass a simple key-value pair
 *    my_field: 'my_value',
 *    // Pass data via Streams
 *    my_file: fs.createReadStream(__dirname + '/unicycle.jpg')
 *  });
 */
export function buildForm(data: Dictionary<any>): FormData {
  const form = new FormData();
  const appendFormValue = (key: string, value: any) => {
    if (value && value.value && value.options) {
      form.append(key, value.value, value.options);
    } else {
      form.append(key, value);
    }
  };
  Object.keys(data).forEach(formKey => {
    const formValue = data[formKey];
    if (Array.isArray(formValue)) {
      formValue.forEach(value => {
        appendFormValue(formKey, value);
      });
    } else {
      appendFormValue(formKey, formValue);
    }
  });

  return form;
}

export default buildForm;
