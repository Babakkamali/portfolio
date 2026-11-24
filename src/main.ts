import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/desktop.css';

import { startClock } from './client/clock';
import { updateYears } from './client/years';

updateYears();
startClock();
