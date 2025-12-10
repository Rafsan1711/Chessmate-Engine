const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    async getOpeningStats(fen) {
        // শুধু প্রথম ৪টি অংশ পাঠানো হবে (Position Turn Castling EnPassant)
        // Move counter বাদ দেওয়া হবে যাতে DB এর সাথে ম্যাচ করে
        const cleanFen = fen.split(" ").slice(0, 4).join(" ");
        const encodedFen = encodeURIComponent(cleanFen);
        const url = `${API_BASE_URL}/stats?fen=${encodedFen}`;

        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return data.found ? data.stats : null;
        } catch (error) {
            return null;
        }
    }
}

window.apiService = new ApiService();
