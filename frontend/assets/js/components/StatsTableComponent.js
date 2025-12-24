class StatsTableComponent {
    constructor(tableBodyId, onMoveSelect) {
        this.tableBody = document.getElementById(tableBodyId);
        this.onMoveSelect = onMoveSelect;
    }

    render(stats, currentTurn) {
        this.tableBody.innerHTML = '';

        if (!stats || !stats.moves || Object.keys(stats.moves).length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <i class="fa-solid fa-database mb-2 fs-4"></i><br>
                        No games found in database
                    </td>
                </tr>`;
            return;
        }

        // Sort by Total Games
        const movesArray = Object.entries(stats.moves).map(([san, data]) => {
            const total = data.white + data.black + data.draw;
            return {
                san: san,
                total: total,
                whitePct: (data.white / total) * 100,
                drawPct: (data.draw / total) * 100,
                blackPct: (data.black / total) * 100
            };
        }).sort((a, b) => b.total - a.total);

        movesArray.forEach((move) => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            
            // Modern Win Bar
            const barHTML = `
                <div class="win-bar-container w-100" style="height: 6px; background: #334155;">
                    <div style="width:${move.whitePct}%; background-color: #cbd5e1;"></div>
                    <div style="width:${move.drawPct}%; background-color: #64748b;"></div>
                    <div style="width:${move.blackPct}%; background-color: #1e293b;"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted mt-1" style="font-size: 0.7rem;">
                    <span>${move.whitePct.toFixed(0)}%</span>
                    <span>${move.drawPct.toFixed(0)}%</span>
                    <span>${move.blackPct.toFixed(0)}%</span>
                </div>
            `;

            row.innerHTML = `
                <td class="fw-bold text-warning">${move.san}</td>
                <td class="text-end font-monospace">${move.total.toLocaleString()}</td>
                <td style="min-width: 120px;">${barHTML}</td>
            `;

            row.addEventListener('click', () => {
                if(this.onMoveSelect) this.onMoveSelect(move.san);
            });

            this.tableBody.appendChild(row);
        });
    }

    setLoading() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span class="ms-2 text-primary">Loading data...</span>
                </td>
            </tr>`;
    }
}

window.StatsTableComponent = StatsTableComponent;
