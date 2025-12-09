// আপনার Render API এর URL এখানে বসান
const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    /**
     * FEN এর জন্য ওপেনিং স্ট্যাটস আনে
     * @param {string} fen - Current FEN (e.g., rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 1)
     * @returns {Promise<object|null>} The stats data or null if not found
     */
    async getOpeningStats(fen) {
        // FEN কে URL এর জন্য এনকোড করা
        const encodedFen = encodeURIComponent(fen);
        const url = `${API_BASE_URL}/stats?fen=${encodedFen}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                // সার্ভার এরর (500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.found) {
                return data.stats;
            } else {
                return null;
            }

        } catch (error) {
            console.error("ApiService Error:", error);
            // এখানে UI এ দেখানোর জন্য একটা Error Notification দিতে পারেন
            return null;
        }
    }
}

// গ্লোবাল এক্সেসের জন্য ইনস্ট্যান্স এক্সপোর্ট করা
window.apiService = new ApiService();
