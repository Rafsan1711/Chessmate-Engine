// আপনার Render API এর URL এখানে বসান
const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    /**
     * FEN এর জন্য ওপেনিং স্ট্যাটস আনে
     * @param {string} fen - Current FEN 
     * @returns {Promise<object|null>} The stats data or null if not found
     */
    async getOpeningStats(fen) {
        // En Passant এবং Move Count বাদ দেওয়ার জন্য আমরা FEN কে ক্লিন করি
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
            // API ডাউন হলে এই এরর আসবে
            return null;
        }
    }
}

window.apiService = new ApiService();
