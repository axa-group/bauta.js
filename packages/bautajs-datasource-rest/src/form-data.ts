/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
