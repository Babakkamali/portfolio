import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/desktop.css';
import './styles/services.css';
import './styles/work.css';
import './styles/contact.css';

import { startClock } from './client/clock';
import { startContactForm } from './client/contact';
import { startServicesMap } from './client/servicesMap';
import { updateYears } from './client/years';

updateYears();
startClock();
startServicesMap();
startContactForm();
