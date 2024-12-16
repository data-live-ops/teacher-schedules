import axios from "axios";

export const fetchScheduleData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (e) {
        console.error(`we got an error in fetching API from spreadsheet: ${e}`);
        return [];
    }
}