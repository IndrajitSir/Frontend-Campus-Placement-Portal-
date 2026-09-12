const fs = require('fs');
const path = require('path');

const dir = '/home/indrajit/Desktop/CPRS/Frontend-Campus-Placement-Portal-/src/Components/System_Analysis';

function processDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('Card.jsx') || file.endsWith('Stats.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes('{loading ? (')) {
                console.log(`Skipping ${file} - already updated`);
                continue;
            }

            // Remove the early returns
            content = content.replace(/^[ \t]*if\s*\(loading\)\s*return\s*<CircleLoader[^>]*>;\r?\n/m, '');
            
            let errorMsg = 'Error fetching analysis data!';
            const errorMatch = content.match(/if\s*\(error\)\s*return\s*<p[^>]*>(.*?)<\/p>;/);
            if (errorMatch) {
                errorMsg = errorMatch[1];
                content = content.replace(/^[ \t]*if\s*\(error\)\s*return\s*<p[^>]*>.*?<\/p>;\r?\n/m, '');
            }
            content = content.replace(/^[ \t]*if\s*\(!Array\.isArray\(data\)\)\s*return\s*<p[^>]*>.*?<\/p>;\r?\n/m, '');
            
            const conditional = `{loading ? (
                            <div className="flex h-full items-center justify-center">
                                <CircleLoader />
                            </div>
                        ) : error ? (
                            <div className="flex h-full items-center justify-center text-center px-4">
                                <p className="text-sm text-red-500">${errorMsg}</p>
                            </div>
                        ) : !Array.isArray(data) || data.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-slate-400">No data available.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">`;

            content = content.replace(/<ResponsiveContainer width="100%" height="100%">/, conditional);
            content = content.replace(/<\/ResponsiveContainer>/, '</ResponsiveContainer>\n                        )}');

            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
}

processDir(dir);
