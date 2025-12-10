const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    async getOpeningStats(fen) {
        // ১. স্ট্যান্ডার্ড FEN (প্রথম ৪ অংশ) তৈরি
        // যেমন: rnbqk... w KQkq e3
        const fenParts = fen.split(" ");
        const baseFen = fenParts.slice(0, 4).join(" ");
        
        // ২. এন-পাসান্ট ছাড়া FEN তৈরি (বিকল্প অপশন)
        // যেমন: rnbqk... w KQkq -
        const fenPartsNoEP = [...fenParts];
        fenPartsNoEP[3] = "-";
        const fallbackFen = fenPartsNoEP.slice(0, 4).join(" ");

        try {
            // প্রথম চেষ্টা: একদম এক্সাক্ট ম্যাচ
            let response = await fetch(`${API_BASE_URL}/stats?fen=${encodeURIComponent(baseFen)}`);
            let data = await response.json();

            if (data.found) {
                return data.stats;
            }

            // যদি না পাওয়া যায় এবং এন-পাসান্ট টার্গেট থাকে, তবে সেটা বাদ দিয়ে চেষ্টা করো
            // কারণ অনেক সময় ডেটাবেসে এন-পাসান্ট টার্গেট সেভ থাকে না
            if (baseFen !== fallbackFen) {
                console.log("Retrying without En Passant target...");
                response = await fetch(`${API_BASE_URL}/stats?fen=${encodeURIComponent(fallbackFen)}`);
                data = await response.json();
                
                if (data.found) {
                    return data.stats;
                }
            }

            return null;

        } catch (error) {
            console.error("ApiService Network Error:", error);
            return null;
        }
    }
}

window.apiService = new ApiService();
