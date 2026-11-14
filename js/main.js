// Bootstrap: create the ViewModel, bind the Views, start loading.

import { LabViewModel } from './viewmodel/labViewModel.js';
import { bindStep1View } from './view/step1View.js';
import { bindStep2View } from './view/step2View.js';
import { bindStep3View } from './view/step3View.js';

const viewModel = new LabViewModel();
bindStep1View(viewModel, document.getElementById('step-1-content'));
bindStep2View(viewModel, document.getElementById('step-2-content'));
bindStep3View(viewModel, document.getElementById('step-3-content'));
viewModel.load();
