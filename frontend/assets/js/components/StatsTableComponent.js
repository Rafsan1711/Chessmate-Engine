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
            this.tableBody.innerHTML = '<tr><td colspan="5">No stats found for this deep or rare position.</td></tr>';
            return;
        }

        // মোট গেমস দিয়ে সর্ট করা
        const moves = Object.entries(stats.moves)
            .sort(([,a], [,b]) => (b.white + b.black + b.draw) - (a.white + a.black + a.draw)); 

        // PGN Table-এর জন্য মুভগুলোকে হোয়াইট/ব্ল্যাক পেয়ারে সাজানো
        let movePairs = [];
        let tempMoves = [...moves];
        
        while(tempMoves.length > 0) {
            // প্রথম মুভ (সাদা বা কালো)
            const move1 = tempMoves.shift();
            // দ্বিতীয় মুভ (যদি থাকে)
            const move2 = tempMoves.length > 0 ? tempMoves.shift() : null;
            
            // PGN টেবিলে মুভ ১ (সাদা), মুভ ২ (কালো), এবং তাদের কম্বাইন্ড স্ট্যাটস দেখাবো
            // তবে সহজ করার জন্য প্রতিটি পজিশনের স্ট্যাটস আলাদা রো-তে দেখাচ্ছি
            
            const [moveSAN, data] = move1;
            const total = data.white + data.black + data.draw;
            
            const whitePct = (data.white / total) * 100;
            const drawPct = (data.draw / total) * 100;
            const blackPct = (data.black / total) * 100;

            const row = this.createRow(moveSAN, total, whitePct, drawPct, blackPct, movePairs.length + 1);
            this.tableBody.appendChild(row);
            
            // PGN স্টাইলে দেখাতে গেলে লজিক আরও জটিল হবে, আমরা এখনকার ডেটা স্ট্রাকচার অনুযায়ী প্রতিটি মুভ পজিশনের বেস্ট মুভ হিসেবে দেখাচ্ছি
        }
        
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
    
    // PGN-Style Row
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
        
        // প্রতিটি মুভ-ই এক একটি নতুন পজিশন থেকে আসছে। তাই আমরা PGN এর মতো না দেখিয়ে Best Move List হিসেবে দেখাচ্ছি।
        // কারণ আমাদের JSON ডেটা প্রতিটি FEN এর জন্য "পরবর্তী চালগুলোর" স্ট্যাটস দেয়, "White's move + Black's move" কম্বিনেশনের স্ট্যাটস নয়।
        row.innerHTML = `
            <td>${moveIndex}.</td>
            <td class="pgn-move-cell">${moveSAN}</td>
            <td>-</td> 
            <td>${total.toLocaleString()}</td>
            <td class="win-rate-bar-col">${winRateBarHTML}</td>
        `;
        return row;
    }
    
    setLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'flex';
        this.tableBody.innerHTML = '<tr><td colspan="5"></td></tr>';
    }
}

window.StatsTableComponent = StatsTableComponent;
