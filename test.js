// REMOVED: import statements
// REMOVED: registerAllModules();

const container = document.querySelector('#citas');

new Handsontable(container, {
    // Note: 'ht-theme-main' requires the specific CSS file for that theme.
    // For the basic CDN version, usually just remove 'themeName' or use default.
    // If you specifically want the dark theme, you need an extra CSS link (see below).
    data: [
        ['Tesla', 2017, 'black', 'black'],
        ['Nissan', 2018, 'blue', 'blue'],
        ['Chrysler', 2019, 'yellow', 'black'],
        ['Volvo', 2020, 'white', 'gray'],
    ],
    colHeaders: ['Car', 'Year', 'Chassis color', 'Bumper color'],
    columns: [
        {},
        { type: 'numeric' },
        {
            type: 'dropdown',
            source: ['yellow', 'red', 'orange', 'green', 'blue', 'gray', 'black', 'white'],
        },
        {
            type: 'dropdown',
            source: ['yellow', 'red', 'orange', 'green', 'blue', 'gray', 'black', 'white'],
        },
    ],
    autoWrapRow: true,
    autoWrapCol: true,
    licenseKey: 'non-commercial-and-evaluation',
});