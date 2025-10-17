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
            platforms: [] // Empty array means all platforms
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
                   this.passesPlatformFilter(entry);
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

    passesPlatformFilter(entry) {
        if (this.filterConfig.platforms.length === 0) return true;
        return this.filterConfig.platforms.includes(entry.Most_Used_Platform);
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
        // Age selectors
        const ageMin = document.getElementById('age-min');
        const ageMax = document.getElementById('age-max');

        ageMin.addEventListener('change', () => {
            if (parseInt(ageMin.value) > parseInt(ageMax.value)) {
                ageMax.value = ageMin.value;
            }
        });

        ageMax.addEventListener('change', () => {
            if (parseInt(ageMax.value) < parseInt(ageMin.value)) {
                ageMin.value = ageMax.value;
            }
        });

        // No additional event listeners needed for platform checkboxes
        // They will be handled in getCurrentFilterConfig()

        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Reset filters button
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });
    }

    updateDisplayValues() {
        this.updateDataInfo();
    }

    updateDataInfo() {
        const filteredCount = this.dataFilters.getFilteredCount();
        const totalCount = this.dataFilters.getTotalCount();

        const filteredCountEl = document.getElementById('filtered-count');
        const totalCountEl = document.getElementById('total-count');

        if (filteredCountEl) filteredCountEl.textContent = filteredCount;
        if (totalCountEl) totalCountEl.textContent = totalCount;
    }

    getCurrentFilterConfig() {
        const genders = [];
        if (document.getElementById('gender-male').checked) genders.push('Male');
        if (document.getElementById('gender-female').checked) genders.push('Female');

        const platforms = [];
        const selectedPlatform = document.getElementById('platform-select').value;
        if (selectedPlatform !== 'all') {
            platforms.push(selectedPlatform);
        }

        return {
            ageMin: parseInt(document.getElementById('age-min').value),
            ageMax: parseInt(document.getElementById('age-max').value),
            genders,
            platforms
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
        // Reset age selectors
        document.getElementById('age-min').value = 18;
        document.getElementById('age-max').value = 24;

        // Reset gender checkboxes
        document.getElementById('gender-male').checked = true;
        document.getElementById('gender-female').checked = true;

        // Reset platform selector
        document.getElementById('platform-select').value = 'all';

        // Update displays
        this.updateDisplayValues();

        // Apply reset filters
        this.dataFilters.resetFilters();

        if (this.onFilterChange) {
            this.onFilterChange(this.dataFilters.getFilteredData());
        }
    }
}
