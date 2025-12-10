// File: frontend/assets/js/components/StatsTableComponent.js

class StatsTableComponent {
    constructor(tableBodyId, onMoveSelect) {
        this.tableBody = document.getElementById(tableBodyId);
        this.onMoveSelect = onMoveSelect;
    }

    render(stats, currentTurn) {
        // লোডিং বা এরর মেসেজ ক্লিয়ার করা
        this.tableBody.innerHTML = '';

        // যদি কোনো স্ট্যাটস না থাকে
        if (!stats || !stats.moves || Object.keys(stats.moves).length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 20px; color: #7f8c8d;">
                        No games found in database for this position.
                    </td>
                </tr>`;
            return;
        }

        // 1. ডেটা প্রসেসিং: অবজেক্ট থেকে অ্যারেতে নেওয়া এবং সর্ট করা (জনপ্রিয়তা অনুযায়ী)
        const movesArray = Object.entries(stats.moves).map(([san, data]) => {
            const total = data.white + data.black + data.draw;
            return {
                san: san, // e4, Nf3 etc.
                total: total,
                whitePct: (data.white / total) * 100,
                drawPct: (data.draw / total) * 100,
                blackPct: (data.black / total) * 100
            };
        }).sort((a, b) => b.total - a.total);

        // 2. টেবিল রেন্ডারিং
        // এখানে আমরা ক্যান্ডিডেট মুভ দেখাচ্ছি (Explorer Mode)
        // আপনি যদি হিস্ট্রি চান, সেটা আলাদা প্যানেলে PGN হিসেবে আছে।
        // এক্সপ্লোরারে আমরা দেখাই: "এই পজিশনে মানুষ কী কী চাল দিয়েছে"
        
        movesArray.forEach((move) => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            
            // Win Rate Bar (Visual)
            const barHTML = `
                <div style="display:flex; height:8px; width:100%; border-radius:2px; overflow:hidden; background:#444;">
                    <div style="width:${move.whitePct}%; background:#bdc3c7;" title="White Won"></div>
                    <div style="width:${move.drawPct}%; background:#7f8c8d;" title="Draw"></div>
                    <div style="width:${move.blackPct}%; background:#2c3e50;" title="Black Won"></div>
                </div>
            `;

            row.innerHTML = `
                <td style="font-weight:bold; color:#f1c40f;">${move.san}</td>
                <td>${move.total.toLocaleString()}</td>
                <td style="font-size:0.85em; color:#2ecc71;">${move.whitePct.toFixed(0)}%</td>
                <td style="font-size:0.85em; color:#95a5a6;">${move.drawPct.toFixed(0)}%</td>
                <td style="font-size:0.85em; color:#e74c3c;">${move.blackPct.toFixed(0)}%</td>
            `;

            // ক্লিকে মুভ করা
            row.addEventListener('click', () => {
                if(this.onMoveSelect) this.onMoveSelect(move.san);
            });

            this.tableBody.appendChild(row);
        });
    }

    setLoading() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 20px;">
                    Loading statistics...
                </td>
            </tr>`;
    }
}

window.StatsTableComponent = StatsTableComponent;
