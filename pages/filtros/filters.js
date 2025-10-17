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
        // Age range sliders
        const ageMin = document.getElementById('age-min');
        const ageMax = document.getElementById('age-max');
        const rangeFill = document.getElementById('range-fill');
        const rangeDisplay = document.getElementById('age-range-display');

        const updateRangeSlider = () => {
            let minVal = parseInt(ageMin.value);
            let maxVal = parseInt(ageMax.value);

            // Ensure min doesn't exceed max
            if (minVal > maxVal) {
                const temp = maxVal;
                maxVal = minVal;
                minVal = temp;
                ageMin.value = minVal;
                ageMax.value = maxVal;
            }

            // Update display
            rangeDisplay.textContent = `${minVal} - ${maxVal}`;

            // Update fill bar position
            const minPercent = ((minVal - 18) / (24 - 18)) * 100;
            const maxPercent = ((maxVal - 18) / (24 - 18)) * 100;

            rangeFill.style.left = `${minPercent}%`;
            rangeFill.style.width = `${maxPercent - minPercent}%`;

            this.applyFilters();
        };

        ageMin.addEventListener('input', updateRangeSlider);
        ageMax.addEventListener('input', updateRangeSlider);

        // Auto-apply filters on change for all filter controls
        document.querySelectorAll('.auto-filter').forEach(element => {
            element.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Initialize range slider
        updateRangeSlider();
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
        const selectedGender = document.querySelector('input[name="gender"]:checked').value;

        if (selectedGender === 'both') {
            genders.push('Male', 'Female');
        } else {
            genders.push(selectedGender);
        }

        const platforms = [];
        const selectedPlatform = document.querySelector('input[name="platform"]:checked').value;
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

        // Reset gender radio buttons
        document.getElementById('gender-both').checked = true;

        // Reset platform radio buttons
        document.getElementById('platform-all').checked = true;

        // Update displays
        this.updateDisplayValues();

        // Apply reset filters
        this.dataFilters.resetFilters();

        if (this.onFilterChange) {
            this.onFilterChange(this.dataFilters.getFilteredData());
        }
    }
}
