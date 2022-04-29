import { className } from '../../dep/frugal/styled.ts';
import { container } from '../../styles/container.style.ts';

export const mainContainer = className('main-container')
    .extends(container)
    .styled`
        max-width: 600px;
        margin-bottom: 5rem;
    `;

export const emphasis = className('emphasis')
    .styled`
        font-weight: bold;
    `;
