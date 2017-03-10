/**
 * Created by s_lei on 2017/3/10.
 */

import _ from 'lodash';
import moment from 'moment';

import 'bootstrap/dist/css/bootstrap.css';


function component(){
    var element = document.createElement('div');

    element.innerHTML = _.join(['Hello' , 'webpack' , moment().format()] , ' ');

    return element;
}

document.body.appendChild(component());


