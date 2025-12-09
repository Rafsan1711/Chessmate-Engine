class StatsTableComponent {
    constructor(tableBodyId, onMoveSelect) {
        this.tableBody = document.getElementById(tableBodyId);
        this.onMoveSelect = onMoveSelect;
    }

    render(stats) {
        this.tableBody.innerHTML = ''; // পুরোনো ডেটা মুছে ফেলা

        if (!stats || !stats.moves || Object.keys(stats.moves).length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="3">No statistics found for this position.</td></tr>';
            return;
        }

        // মুভগুলোকে বেশি গেমসের ভিত্তিতে সর্ট করা
        const moves = Object.entries(stats.moves)
            .sort(([,a], [,b]) => b.total - a.total); // আমরা JSON এ মোট গেমস 'total' হিসেবে রাখিনি, তাই এখন ক্যালকুলেট করব।

        moves.forEach(([moveSAN, data]) => {
            const total = data.white + data.black + data.draw;
            
            // যদি আমরা DB তে total গেমস সেভ না করে থাকি, তবে এখানে ক্যালকুলেট করব
            // যদি আপনি DB তে 'total_games' সেভ করে থাকেন, তবে সেই ভ্যালু ব্যবহার করবেন
            
            const whitePct = (data.white / total) * 100;
            const drawPct = (data.draw / total) * 100;
            const blackPct = (data.black / total) * 100;

            const row = this.createRow(moveSAN, total, whitePct, drawPct, blackPct);
            this.tableBody.appendChild(row);
        });
        
        // ক্লিক লিসেনার যুক্ত করা
        this.tableBody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', (e) => {
                const moveSAN = row.getAttribute('data-move');
                if (moveSAN && this.onMoveSelect) {
                    this.onMoveSelect(moveSAN);
                }
            });
        });
    }
    
    createRow(moveSAN, total, wPct, dPct, bPct) {
        const row = document.createElement('tr');
        row.setAttribute('data-move', moveSAN);
        
        row.innerHTML = `
            <td><b>${moveSAN}</b></td>
            <td>${total}</td>
            <td>
                <div class="win-rate-bar">
                    <div class="bar-segment white-segment" style="width: ${wPct.toFixed(1)}%;"></div>
                    <div class="bar-segment draw-segment" style="width: ${dPct.toFixed(1)}%;"></div>
                    <div class="bar-segment black-segment" style="width: ${bPct.toFixed(1)}%;"></div>
                </div>
                <div style="font-size: 0.7em; margin-top: 2px;">
                    W:${wPct.toFixed(0)}% / D:${dPct.toFixed(0)}% / B:${bPct.toFixed(0)}%
                </div>
            </td>
        `;
        return row;
    }
    
    setLoading() {
        this.tableBody.innerHTML = '<tr><td colspan="3">⏳ Loading stats...</td></tr>';
    }
}

window.StatsTableComponent = StatsTableComponent;
