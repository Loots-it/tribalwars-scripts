ScriptAPI.register('Single Village Scavenge Tool', true, 'Kerouac', 'nl.tribalwars@coma.innogames.de');

(async () => {
    const searchParams = (type) => new URLSearchParams(window.location.search).get(type);
    const mode = game_data.mode ?? searchParams('mode'), screen = game_data.screen ?? searchParams('screen');
    if (screen === 'place' && mode === 'scavenge') {
        const localStorageKey = `Toxic_Donut_s_Single_Village_Scavenging_Settings_${game_data.world}`;
        const singleVillageScavengeSettings = JSON.parse(localStorage.getItem(localStorageKey)) ??
            {
                units: {},
                scavenges: {
                    'scavengeOption_1': true,
                    'scavengeOption_2': true,
                    'scavengeOption_3': true,
                    'scavengeOption_4': true
                }
            };
        const singleVillageFormulas = {
            '1': {1: 100},
            '2': {2: 100},
            '3': {3: 100},
            '4': {4: 100},
            '1,2': {1: 100, 2: 28.57},
            '1,2,3': {1: 100, 2: 28.57, 3: 12.5},
            '1,2,3,4': {1: 100, 2: 28.57, 3: 12.5, 4: 7.69},
            '2,3,4': {2: 100, 3: 33.33, 4: 18.18},
            '3,4': {3: 100, 4: 40.00},
            '2,3': {2: 100, 3: 33.33},
        };

        const checkCheckbox = (type, key) => singleVillageScavengeSettings[type][key] ? 'checked' : '';
        const fillInUnits = () => {
            $('.unitsInput').get().forEach(input => $(input).val('').trigger('change'));
            const selectedTypes = $('.scavengeType:checked').get().filter(type => $(type).closest('.scavenge-option').has('.free_send_button').length > 0).map(type => Number($(type).data('scavengetype'))).toString();

            if(selectedTypes.length) {
                const currentOption = $('.free_send_button').closest('.scavenge-option').has('.scavengeType:checked').last().index() + 1;
                const currentPercentage = singleVillageFormulas[selectedTypes][currentOption];

                Object.keys(singleVillageScavengeSettings['units'])
                    .filter(unit => singleVillageScavengeSettings['units'][unit])
                    .forEach(unit => {
                        const amount = parseInt($(`.candidate-squad-container .units-entry-all[data-unit="${unit}"]`).text().trim().replaceAll(/\(|\)/g, ''));
                        const inputValue = Math.round(amount * currentPercentage / 100);

                        $(`.unitsInput[name="${unit}"]`).val(inputValue).trigger("change");
                    });
            } else {
                UI.ErrorMessage(`All scavenges are already running or none are selected.`);
            }

        }

        if (!$('.scavengeSetting').length) {
            game_data.units.forEach(unit => $(`.unit_link[data-unit=${unit}]`).before(`<input type='checkbox' class='scavengeSetting unitCheckboxes' ${checkCheckbox('units', unit)} data-key='units' data-type='${unit}'>`));

            $('.title').get().filter(scavengeType => $(scavengeType).closest('.scavenge-option').find('.unlock-button:visible').length <= 0)
                .forEach((scavengeType, index) => $(scavengeType).prepend(`<input style='vertical-align: -2px' type='checkbox' class='scavengeSetting scavengeType' data-key='scavenges' data-scavengetype='${index + 1}' data-type='scavengeOption_${index + 1}' ${checkCheckbox('scavenges', `scavengeOption_${index + 1}`)}>`));

            $('.scavengeSetting').on('click', ({target}) => {
                const keyType = $(target).data('key');
                const checkboxType = $(target).data('type');
                singleVillageScavengeSettings[keyType][checkboxType] = $(target).prop('checked');

                localStorage.setItem(localStorageKey, JSON.stringify(singleVillageScavengeSettings));
            });
            $('th.squad-village-required').prepend('<input style="width: 100%" type="button" class="btn" value="Refresh">').on('click', () => fillInUnits());
        }
        const checkedUnits = $('.unitCheckboxes:checked'), sendButton = $('.free_send_button');

        if ($(checkedUnits).length && $('.scavengeType:checked').length && $(sendButton).length) {
            let filledInAlready = $(checkedUnits).get().filter(unit => Number($(`.unitsInput[name="${$(unit).data('type')}"]`).val()) > 0).length > 0;

            if (!filledInAlready) {
                fillInUnits();
            } else {
                $('.scavenge-option').has('.scavengeType:checked').has('.free_send_button').last().find('.free_send_button').click();
            }
        } else if (!$(sendButton).length) {
            UI.ErrorMessage(`Either all possible scavenges are already running or none are unlocked.`);
        } else if (!$(checkedUnits).length) {
            UI.ErrorMessage(`You atleast need to select one unit before the script can start, reactivate the script after selecting some units.`);
        } else {
            UI.ErrorMessage(`You atleast need to select one scavenge type before the script can start, reactivate the script after selecting at least one scavenge type.`);
        }
    } else {
        location.href = game_data.link_base_pure + 'place&mode=scavenge'
    }
})();