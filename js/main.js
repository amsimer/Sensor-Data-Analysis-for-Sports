// Bootstrap: create the ViewModel, bind the Views, start loading.

import { LabViewModel } from './viewmodel/labViewModel.js';
import { bindStep1View } from './view/step1View.js';

const viewModel = new LabViewModel();
bindStep1View(viewModel, document.getElementById('step-1-content'));
viewModel.load();
