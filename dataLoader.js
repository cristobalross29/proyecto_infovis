export async function loadCSVData() {
    try {
        const response = await fetch('DataSetSocialMedia.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(row);
            }
        }
        return data;
    } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
    }
}