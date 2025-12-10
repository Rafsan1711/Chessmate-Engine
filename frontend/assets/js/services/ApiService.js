const API_BASE_URL = "https://analysis-chess.onrender.com/api";

class ApiService {
    
    // রি-ট্রাই লজিক সহ ফেচ ফাংশন
    async fetchWithRetry(url, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Server Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
                if (i === retries - 1) throw error; // শেষ চেষ্টায় না পারলে এরর দাও
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    async getOpeningStats(fen) {
        // ১. স্ট্যান্ডার্ড FEN (প্রথম ৪ অংশ) তৈরি
        const fenParts = fen.split(" ");
        const baseFen = fenParts.slice(0, 4).join(" ");
        
        // ২. এন-পাসান্ট ছাড়া FEN তৈরি (বিকল্প অপশন)
        const fenPartsNoEP = [...fenParts];
        fenPartsNoEP[3] = "-";
        const fallbackFen = fenPartsNoEP.slice(0, 4).join(" ");

        try {
            // প্রথম চেষ্টা: একদম এক্সাক্ট ম্যাচ
            let url = `${API_BASE_URL}/stats?fen=${encodeURIComponent(baseFen)}`;
            let data = await this.fetchWithRetry(url);

            if (data && data.found) {
                return data.stats;
            }

            // যদি না পাওয়া যায় এবং এন-পাসান্ট টার্গেট থাকে, তবে সেটা বাদ দিয়ে চেষ্টা করো
            if (baseFen !== fallbackFen) {
                console.log("Retrying without En Passant target...");
                url = `${API_BASE_URL}/stats?fen=${encodeURIComponent(fallbackFen)}`;
                data = await this.fetchWithRetry(url);
                
                if (data && data.found) {
                    return data.stats;
                }
            }

            return null;

        } catch (error) {
            console.error("ApiService Error (Check Internet/Server):", error);
            return null;
        }
    }
}

window.apiService = new ApiService();
