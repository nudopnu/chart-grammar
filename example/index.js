const SAMPLE_TEXT = `title "Sales Revenue"
labels [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
stack "Stack 0" ["Dataset 1", "Dataset 2"]
bar "Dataset 1" [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
bar "Dataset 2" [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
bar "Dataset 3" [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
line "Dataset 4" [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`;

function parseConfig(text) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const result = parser.feed(text).results[0];
    return toConfig(result);
}

function toConfig(result) {
    const config = {
        data: {
            datasets: []
        },
        options: {
            scales: {}
        }
    };
    const stackMap = {};

    if (result.stack?.length > 0) {
        config.options.scales.x = { stacked: true };
        config.options.scales.y = { stacked: true };
        result.stack.forEach(stack => {
            stack.datasets.forEach(name => {
                stackMap[name] = stack.name;
            });
        });
    }
    if (result.labels) {
        config.data.labels = result.labels;
    }
    if (result.title) {
        config.options.plugins = {
            title: {
                display: true,
                text: result.title,
            }
        };
    }
    if (result.line) {
        result.line.forEach(line => {
            const dataset = {
                label: line.name,
                data: line.dataset,
                type: 'line',
                borderColor: getRandomColor(),
                borderWidth: 2,
                tension: 0.4,
            };
            if (line.name in stackMap) {
                dataset.stack = stackMap[line.name];
            }
            config.data.datasets.push(dataset);
        });
    }
    if (result.bar) {
        result.bar.forEach(bar => {
            const dataset = {
                label: bar.name,
                data: bar.dataset,
                type: 'bar',
                backgroundColor: getRandomColor(),
            };
            if (bar.name in stackMap) {
                dataset.stack = stackMap[bar.name];
            }
            config.data.datasets.push(dataset);
        });
    }
    return config;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
