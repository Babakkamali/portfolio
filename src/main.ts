import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/desktop.css';
import './styles/services.css';

import { startClock } from './client/clock';
import { startServicesMap } from './client/servicesMap';
import { updateYears } from './client/years';

updateYears();
startClock();
startServicesMap();
