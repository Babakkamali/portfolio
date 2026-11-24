import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/desktop.css';
import './styles/services.css';
import './styles/work.css';
import './styles/contact.css';
import './styles/terminal.css';

import { startClock } from './client/clock.ts';
import { startContactForm } from './client/contact.ts';
import { startLive } from './client/live.ts';
import { startNetMeter } from './client/netMeter.ts';
import { startServicesMap } from './client/servicesMap.ts';
import { startTerminal } from './client/terminal.ts';
import { startWorkspaces } from './client/workspaces.ts';
import { updateYears } from './client/years.ts';

updateYears();
startClock();
startServicesMap();
startContactForm();
startWorkspaces();
startTerminal();
startNetMeter();
void startLive();
