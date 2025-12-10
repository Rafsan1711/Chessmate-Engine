// File Path: frontend/assets/js/components/StatsTableComponent.js

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
            this.tableBody.innerHTML = '<tr><td colspan="4">No stats found for this deep or rare position.</td></tr>';
            return;
        }

        const moves = Object.entries(stats.moves)
            .sort(([,a], [,b]) => (b.white + b.black + b.draw) - (a.white + a.black + a.draw)); 
        
        let moveIndex = 0; // PGN move number
        
        moves.forEach(([moveSAN, data]) => {
            moveIndex++;
            const total = data.white + data.black + data.draw;
            
            const whitePct = (data.white / total) * 100;
            const drawPct = (data.draw / total) * 100;
            const blackPct = (data.black / total) * 100;

            const row = this.createRow(moveSAN, total, whitePct, drawPct, blackPct, moveIndex);
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
    
    // PGN-Style Row (প্রতিটি মুভ একটি নতুন পজিশন থেকে আসছে, তাই এটিই PGN-Explorer স্ট্যান্ডার্ড)
    createRow(moveSAN, total, wPct, dPct, bPct, moveIndex) {
        const row = document.createElement('tr');
        row.setAttribute('data-move', moveSAN);
        
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
            <td>${moveIndex}.</td>
            <td class="pgn-move-cell">${moveSAN}</td>
            <td>${total.toLocaleString()}</td>
            <td class="win-rate-bar-col">${winRateBarHTML}</td>
        `;
        return row;
    }
    
    setLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'flex';
        this.tableBody.innerHTML = '<tr><td colspan="4"></td></tr>';
    }
}

window.StatsTableComponent = StatsTableComponent;
