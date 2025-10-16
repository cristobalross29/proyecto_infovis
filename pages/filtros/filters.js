export class DataFilters {
    constructor() {
        this.allData = [];
        this.filteredData = [];
        this.filterConfig = this.getDefaultFilters();
    }

    getDefaultFilters() {
        return {
            ageMin: 18,
            ageMax: 24,
            genders: ['Male', 'Female'],
            conflictsMin: 0,
            conflictsMax: 5
        };
    }

    setData(data) {
        this.allData = data;
        this.filteredData = [...data]; // Create a copy to avoid reference issues
    }

    applyFilters(config) {
        this.filterConfig = { ...this.filterConfig, ...config };

        this.filteredData = this.allData.filter(entry => {
            return this.passesAgeFilter(entry) &&
                   this.passesGenderFilter(entry) &&
                   this.passesConflictsFilter(entry);
        });

        return this.filteredData;
    }

    passesAgeFilter(entry) {
        const age = parseInt(entry.Age);
        return age >= this.filterConfig.ageMin && age <= this.filterConfig.ageMax;
    }

    passesGenderFilter(entry) {
        if (this.filterConfig.genders.length === 0) return true;
        return this.filterConfig.genders.includes(entry.Gender);
    }

    passesConflictsFilter(entry) {
        const conflicts = parseInt(entry.Conflicts_Over_Social_Media);
        return conflicts >= this.filterConfig.conflictsMin &&
               conflicts <= this.filterConfig.conflictsMax;
    }

    getFilteredData() {
        return this.filteredData;
    }

    getAllData() {
        return this.allData;
    }

    getFilteredCount() {
        return this.filteredData.length;
    }

    getTotalCount() {
        return this.allData.length;
    }

    resetFilters() {
        this.filterConfig = this.getDefaultFilters();
        this.filteredData = [...this.allData];
        return this.filteredData;
    }
}

export class FilterUI {
    constructor(dataFilters, onFilterChange) {
        this.dataFilters = dataFilters;
        this.onFilterChange = onFilterChange;
        this.initializeUI();
    }

    initializeUI() {
        this.setupEventListeners();
        this.updateDisplayValues();
    }

    setupEventListeners() {
        // Age sliders
        const ageMin = document.getElementById('age-min');
        const ageMax = document.getElementById('age-max');

        ageMin.addEventListener('input', () => {
            if (parseInt(ageMin.value) > parseInt(ageMax.value)) {
                ageMin.value = ageMax.value;
            }
            this.updateAgeDisplay();
        });

        ageMax.addEventListener('input', () => {
            if (parseInt(ageMax.value) < parseInt(ageMin.value)) {
                ageMax.value = ageMin.value;
            }
            this.updateAgeDisplay();
        });

        // Conflicts sliders
        const conflictsMin = document.getElementById('conflicts-min');
        const conflictsMax = document.getElementById('conflicts-max');

        conflictsMin.addEventListener('input', () => {
            if (parseInt(conflictsMin.value) > parseInt(conflictsMax.value)) {
                conflictsMin.value = conflictsMax.value;
            }
            this.updateConflictsDisplay();
        });

        conflictsMax.addEventListener('input', () => {
            if (parseInt(conflictsMax.value) < parseInt(conflictsMin.value)) {
                conflictsMax.value = conflictsMin.value;
            }
            this.updateConflictsDisplay();
        });

        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Reset filters button
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });
    }

    updateAgeDisplay() {
        const min = document.getElementById('age-min').value;
        const max = document.getElementById('age-max').value;
        document.getElementById('age-range-display').textContent = `${min} - ${max}`;
    }

    updateConflictsDisplay() {
        const min = document.getElementById('conflicts-min').value;
        const max = document.getElementById('conflicts-max').value;
        document.getElementById('conflicts-range-display').textContent = `${min} - ${max}`;
    }

    updateDisplayValues() {
        this.updateAgeDisplay();
        this.updateConflictsDisplay();
        this.updateDataInfo();
    }

    updateDataInfo() {
        const filteredCount = this.dataFilters.getFilteredCount();
        const totalCount = this.dataFilters.getTotalCount();

        document.getElementById('filtered-count').textContent = filteredCount;
        document.getElementById('total-count').textContent = totalCount;
    }

    getCurrentFilterConfig() {
        const genders = [];
        if (document.getElementById('gender-male').checked) genders.push('Male');
        if (document.getElementById('gender-female').checked) genders.push('Female');

        return {
            ageMin: parseInt(document.getElementById('age-min').value),
            ageMax: parseInt(document.getElementById('age-max').value),
            genders,
            conflictsMin: parseInt(document.getElementById('conflicts-min').value),
            conflictsMax: parseInt(document.getElementById('conflicts-max').value)
        };
    }

    applyFilters() {
        const config = this.getCurrentFilterConfig();
        this.dataFilters.applyFilters(config);
        this.updateDataInfo();

        if (this.onFilterChange) {
            this.onFilterChange(this.dataFilters.getFilteredData());
        }
    }

    resetFilters() {
        // Reset age sliders
        document.getElementById('age-min').value = 18;
        document.getElementById('age-max').value = 24;

        // Reset gender checkboxes
        document.getElementById('gender-male').checked = true;
        document.getElementById('gender-female').checked = true;

        // Reset conflicts sliders
        document.getElementById('conflicts-min').value = 0;
        document.getElementById('conflicts-max').value = 5;

        // Update displays
        this.updateDisplayValues();

        // Apply reset filters
        this.dataFilters.resetFilters();

        if (this.onFilterChange) {
            this.onFilterChange(this.dataFilters.getFilteredData());
        }
    }
}
