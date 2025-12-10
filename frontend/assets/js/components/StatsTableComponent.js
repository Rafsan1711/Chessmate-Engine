class StatsTableComponent {
    constructor(tableBodyId, onMoveSelect) {
        this.tableBody = document.getElementById(tableBodyId);
        this.onMoveSelect = onMoveSelect;
    }

    render(stats) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';

        this.tableBody.innerHTML = ''; 

        if (!stats || !stats.moves || Object.keys(stats.moves).length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="3">No stats found for this deep or rare position.</td></tr>';
            return;
        }

        // মোট গেমস দিয়ে সর্ট করা
        const moves = Object.entries(stats.moves)
            .sort(([,a], [,b]) => (b.white + b.black + b.draw) - (a.white + a.black + a.draw)); 

        moves.forEach(([moveSAN, data]) => {
            const total = data.white + data.black + data.draw;
            
            const whitePct = (data.white / total) * 100;
            const drawPct = (data.draw / total) * 100;
            const blackPct = (data.black / total) * 100;

            const row = this.createRow(moveSAN, total, whitePct, drawPct, blackPct);
            this.tableBody.appendChild(row);
        });
        
        // ক্লিক লিসেনার যুক্ত করা
        this.tableBody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', () => {
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
        
        // Win Rate Bar তৈরি
        const winRateBarHTML = `
            <div class="win-rate-bar">
                <div class="bar-segment white-segment" style="width: ${wPct.toFixed(1)}%;">
                    ${wPct > 10 ? wPct.toFixed(0) + '%' : ''}
                </div>
                <div class="bar-segment draw-segment" style="width: ${dPct.toFixed(1)}%;">
                    ${dPct > 10 ? dPct.toFixed(0) + '%' : ''}
                </div>
                <div class="bar-segment black-segment" style="width: ${bPct.toFixed(1)}%;">
                    ${bPct > 10 ? bPct.toFixed(0) + '%' : ''}
                </div>
            </div>
        `;
        
        row.innerHTML = `
            <td><b>${moveSAN}</b></td>
            <td>${total.toLocaleString()}</td>
            <td>
                ${winRateBarHTML}
            </td>
        `;
        return row;
    }
    
    setLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'flex';
        this.tableBody.innerHTML = '<tr><td colspan="3"></td></tr>';
    }
}

window.StatsTableComponent = StatsTableComponent;
