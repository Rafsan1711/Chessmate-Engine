const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    async getOpeningStats(fen) {
        const cleanFen = fen.split(" ").slice(0, 4).join(" ");
        const encodedFen = encodeURIComponent(cleanFen);
        const url = `${API_BASE_URL}/stats?fen=${encodedFen}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`API Error: ${response.status} for FEN: ${cleanFen}`);
                return null;
            }

            const data = await response.json();
            if (data.found) {
                return data.stats;
            } else {
                return null;
            }

        } catch (error) {
            console.error("ApiService Network Error:", error);
            return null;
        }
    }
}

window.apiService = new ApiService();
