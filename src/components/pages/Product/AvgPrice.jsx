import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    AlertTriangle,
    Download,
    Filter,
    BarChart3,
    PieChart,
} from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Doughnut, Line, PolarArea, Radar } from "react-chartjs-2";
import "../../styles/AvgPrice.css";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AvgPrice({ products = [], onBack }) {
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);

    // Animated counters
    const [animatedAvgPrice, setAnimatedAvgPrice] = useState(0);
    const [animatedTotalValue, setAnimatedTotalValue] = useState(0);

    // Price calculations
    const priceMetrics = useMemo(() => {
        const avgPrice =
            products.length > 0
                ? products.reduce((sum, p) => sum + Number(p.price), 0) / products.length
                : 0;

        const highestPriceProduct = products.reduce(
            (max, p) => (Number(p.price) > Number(max.price) ? p : max),
            products[0] || { price: "0" }
        );

        const lowestPriceProduct = products.reduce(
            (min, p) => (Number(p.price) < Number(min.price) ? p : min),
            products[0] || { price: "0" }
        );

        const totalValue = products.reduce(
            (sum, p) => sum + Number(p.price) * p.stock,
            0
        );

        const avgProfitMargin =
            products.length > 0
                ? products.reduce((sum, p) => {
                    const profit = Number(p.price) - Number(p.cost);
                    const margin = Number(p.price) > 0 ? (profit / Number(p.price)) * 100 : 0;
                    return sum + margin;
                }, 0) / products.length
                : 0;

        return {
            avgPrice,
            highestPriceProduct,
            lowestPriceProduct,
            totalValue,
            avgProfitMargin,
        };
    }, [products]);

    // Animated counter effect
    useEffect(() => {
        const duration = 1000;
        const steps = 60;
        const increment = priceMetrics.avgPrice / steps;
        const valueIncrement = priceMetrics.totalValue / steps;
        let current = 0;

        const timer = setInterval(() => {
            current++;
            setAnimatedAvgPrice(Math.min(increment * current, priceMetrics.avgPrice));
            setAnimatedTotalValue(Math.min(valueIncrement * current, priceMetrics.totalValue));

            if (current >= steps) {
                clearInterval(timer);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [priceMetrics.avgPrice, priceMetrics.totalValue]);

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = products.filter((p) => {
            const price = Number(p.price);
            const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
            const matchesPrice = price >= minPrice && price <= maxPrice;
            return matchesCategory && matchesPrice;
        });

        filtered.sort((a, b) => {
            const diff = Number(a.price) - Number(b.price);
            return sortOrder === "asc" ? diff : -diff;
        });

        return filtered;
    }, [products, categoryFilter, minPrice, maxPrice, sortOrder]);

    // Categories
    const categories = useMemo(() => {
        return [...new Set(products.map((p) => p.category))];
    }, [products]);

    // Chart: Average Price by Category
    const avgPriceByCategoryData = useMemo(() => {
        const categoryAvg = {};

        products.forEach((p) => {
            if (!categoryAvg[p.category]) {
                categoryAvg[p.category] = { sum: 0, count: 0 };
            }
            categoryAvg[p.category].sum += Number(p.price);
            categoryAvg[p.category].count += 1;
        });

        const labels = Object.keys(categoryAvg);
        const data = labels.map((cat) => categoryAvg[cat].sum / categoryAvg[cat].count);

        return {
            labels,
            datasets: [
                {
                    label: "Avg Price (Rs)",
                    data,
                    backgroundColor: "rgba(249, 115, 22, 0.8)",
                    borderColor: "rgba(249, 115, 22, 1)",
                    borderWidth: 1,
                },
            ],
        };
    }, [products]);

    // Chart: Highest vs Lowest
    const highLowData = useMemo(() => ({
        labels: ["Highest", "Lowest"],
        datasets: [
            {
                data: [
                    Number(priceMetrics.highestPriceProduct.price),
                    Number(priceMetrics.lowestPriceProduct.price),
                ],
                backgroundColor: ["rgba(249, 115, 22, 0.8)", "rgba(251, 191, 36, 0.8)"],
                borderWidth: 2,
                borderColor: "#fff",
            },
        ],
    }), [priceMetrics]);

    // Chart: Price Trend
    const priceTrendData = useMemo(() => {
        const sorted = [...products].sort(
            (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );

        return {
            labels: sorted.map((p) => p.dateAdded),
            datasets: [
                {
                    label: "Price (Rs)",
                    data: sorted.map((p) => Number(p.price)),
                    fill: true,
                    backgroundColor: "rgba(249, 115, 22, 0.2)",
                    borderColor: "rgba(249, 115, 22, 1)",
                    tension: 0.4,
                    pointBackgroundColor: "rgba(249, 115, 22, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
            ],
        };
    }, [products]);

    // Chart: Price Distribution
    const priceDistributionData = useMemo(() => {
        const ranges = [
            { label: "0-1000", min: 0, max: 1000 },
            { label: "1001-2000", min: 1001, max: 2000 },
            { label: "2001-3000", min: 2001, max: 3000 },
            { label: "3001-4000", min: 3001, max: 4000 },
            { label: "4001+", min: 4001, max: Infinity },
        ];

        const counts = ranges.map((range) =>
            products.filter((p) => {
                const price = Number(p.price);
                return price >= range.min && price <= range.max;
            }).length
        );

        return {
            labels: ranges.map((r) => r.label),
            datasets: [
                {
                    label: "Products",
                    data: counts,
                    backgroundColor: "rgba(249, 115, 22, 0.8)",
                    borderColor: "rgba(249, 115, 22, 1)",
                    borderWidth: 1,
                },
            ],
        };
    }, [products]);

    // Chart: Revenue by Price Range
    const revenueByPriceData = useMemo(() => {
        const ranges = [
            { label: "0-1000", min: 0, max: 1000 },
            { label: "1001-2000", min: 1001, max: 2000 },
            { label: "2001-3000", min: 2001, max: 3000 },
            { label: "3001-4000", min: 3001, max: 4000 },
            { label: "4001+", min: 4001, max: Infinity },
        ];

        const revenues = ranges.map((range) =>
            products
                .filter((p) => {
                    const price = Number(p.price);
                    return price >= range.min && price <= range.max;
                })
                .reduce((sum, p) => sum + Number(p.price) * (p.soldCount || 0), 0)
        );

        return {
            labels: ranges.map((r) => r.label),
            datasets: [
                {
                    data: revenues,
                    backgroundColor: [
                        "rgba(249, 115, 22, 0.8)",
                        "rgba(251, 191, 36, 0.7)",
                        "rgba(234, 88, 12, 0.8)",
                        "rgba(255, 237, 213, 0.6)",
                        "rgba(194, 65, 12, 0.8)",
                    ],
                    borderWidth: 2,
                    borderColor: "#fff",
                },
            ],
        };
    }, [products]);

    // Chart: Profit Margin by Product
    const profitMarginData = useMemo(() => {
        const margins = products.map((p) => {
            const profit = Number(p.price) - Number(p.cost);
            return Number(p.price) > 0 ? (profit / Number(p.price)) * 100 : 0;
        });

        return {
            labels: products.map((p) => p.name).slice(0, 10),
            datasets: [
                {
                    label: "Profit Margin %",
                    data: margins.slice(0, 10),
                    backgroundColor: "rgba(249, 115, 22, 0.3)",
                    borderColor: "rgba(249, 115, 22, 1)",
                    borderWidth: 2,
                    pointBackgroundColor: "rgba(249, 115, 22, 1)",
                },
            ],
        };
    }, [products]);

    // Insights
    const insights = useMemo(() => {
        if (products.length === 0) return [];

        const categoryAvg = {};
        products.forEach((p) => {
            if (!categoryAvg[p.category]) {
                categoryAvg[p.category] = { sum: 0, count: 0 };
            }
            categoryAvg[p.category].sum += Number(p.price);
            categoryAvg[p.category].count += 1;
        });

        const mostExpensiveCat = Object.keys(categoryAvg).reduce((a, b) =>
            categoryAvg[a].sum / categoryAvg[a].count > categoryAvg[b].sum / categoryAvg[b].count
                ? a
                : b, products[0]?.category || ""
        );

        const cheapestCat = Object.keys(categoryAvg).reduce((a, b) =>
            categoryAvg[a].sum / categoryAvg[a].count < categoryAvg[b].sum / categoryAvg[b].count
                ? a
                : b, products[0]?.category || ""
        );

        const bestProfit = products.reduce((max, p) => {
            const profit = Number(p.price) - Number(p.cost);
            const maxProfit = Number(max.price) - Number(max.cost);
            return profit > maxProfit ? p : max;
        }, products[0] || {});

        const overpriced = products.filter((p) => {
            const margin = ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100;
            return margin > 70;
        });

        const lowProfit = products.filter((p) => {
            const margin = ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100;
            return margin < 20 && margin > 0;
        });

        return [
            {
                icon: <TrendingUp size={20} />,
                text: `${mostExpensiveCat} is most expensive category`,
                type: "info",
            },
            {
                icon: <TrendingDown size={20} />,
                text: `${cheapestCat} is cheapest category`,
                type: "info",
            },
            {
                icon: <DollarSign size={20} />,
                text: `${bestProfit.name} has best profit margin`,
                type: "success",
            },
            {
                icon: <AlertTriangle size={20} />,
                text: `${overpriced.length} products may be overpriced`,
                type: overpriced.length > 0 ? "warning" : "success",
            },
            {
                icon: <AlertTriangle size={20} />,
                text: `${lowProfit.length} products have low profit`,
                type: lowProfit.length > 3 ? "warning" : "info",
            },
        ];
    }, [products]);

    // Table data
    const tableData = useMemo(() => {
        return filteredProducts.map((p) => {
            const revenue = Number(p.price) * (p.soldCount || 0);
            const totalCost = Number(p.cost) * (p.soldCount || 0);
            const profit = revenue - totalCost;
            const profitPercent =
                Number(p.price) > 0
                    ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100
                    : 0;
            const stockValue = Number(p.price) * p.stock;

            return {
                ...p,
                revenue,
                profit,
                profitPercent,
                stockValue,
            };
        });
    }, [filteredProducts]);

    const handleExport = () => {
        const csvContent = [
            ["Product", "Cost", "Price", "Profit", "Profit %", "Stock Value"],
            ...tableData.map((p) => [
                p.name,
                p.cost,
                p.price,
                Number(p.price) - Number(p.cost),
                p.profitPercent.toFixed(2),
                p.stockValue,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pricing-analytics.csv";
        a.click();
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    color: "#64748b",
                    padding: 15,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(148, 163, 184, 0.1)" },
                ticks: { color: "#64748b", font: { size: 10 } },
            },
            y: {
                grid: { color: "rgba(148, 163, 184, 0.1)" },
                ticks: { color: "#64748b" },
            },
        },
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "bottom", labels: { color: "#64748b" } },
        },
        scales: {
            r: {
                angleLines: { color: "rgba(148, 163, 184, 0.2)" },
                grid: { color: "rgba(148, 163, 184, 0.2)" },
                pointLabels: { color: "#64748b", font: { size: 10 } },
                ticks: { color: "#64748b", backdropColor: "transparent" },
            },
        },
    };

    return (
        <div className="avgprice-page">
            {/* Header */}
            <motion.div
                className="avgprice-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button className="back-button-avg" onClick={onBack}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content-avg">
                    <div className="header-left-avg">
                        <div className="header-icon-avg">
                            <DollarSign size={32} />
                        </div>
                        <div>
                            <h1 className="avgprice-title">Pricing Analytics Dashboard</h1>
                            <p className="avgprice-subtitle">Advanced pricing insights & profitability analysis</p>
                        </div>
                    </div>
                    <button className="export-button-avg" onClick={handleExport}>
                        <Download size={18} />
                        Export Analytics
                    </button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="kpi-grid-avg">
                <motion.div
                    className="kpi-card-avg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="kpi-icon-avg revenue-avg">
                        <BarChart3 size={24} />
                    </div>
                    <div className="kpi-content-avg">
                        <div className="kpi-label-avg">Average Price</div>
                        <div className="kpi-value-avg">Rs {Math.round(animatedAvgPrice).toLocaleString()}</div>
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card-avg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="kpi-icon-avg highest-avg">
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content-avg">
                        <div className="kpi-label-avg">Highest Price Product</div>
                        <div className="kpi-value-text-avg">
                            {priceMetrics.highestPriceProduct.name}
                        </div>
                        <div className="kpi-sublabel-avg">
                            Rs {Number(priceMetrics.highestPriceProduct.price).toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card-avg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="kpi-icon-avg lowest-avg">
                        <TrendingDown size={24} />
                    </div>
                    <div className="kpi-content-avg">
                        <div className="kpi-label-avg">Lowest Price Product</div>
                        <div className="kpi-value-text-avg">
                            {priceMetrics.lowestPriceProduct.name}
                        </div>
                        <div className="kpi-sublabel-avg">
                            Rs {Number(priceMetrics.lowestPriceProduct.price).toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card-avg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="kpi-icon-avg value-avg">
                        <Package size={24} />
                    </div>
                    <div className="kpi-content-avg">
                        <div className="kpi-label-avg">Total Product Value</div>
                        <div className="kpi-value-avg">Rs {Math.round(animatedTotalValue).toLocaleString()}</div>
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card-avg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="kpi-icon-avg margin-avg">
                        <PieChart size={24} />
                    </div>
                    <div className="kpi-content-avg">
                        <div className="kpi-label-avg">Avg Profit Margin</div>
                        <div className="kpi-value-avg">{priceMetrics.avgProfitMargin.toFixed(1)}%</div>
                    </div>
                </motion.div>
            </div>

            {/* Insights */}
            <motion.div
                className="insights-section-avg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h2 className="section-title-avg">Pricing Insights</h2>
                <div className="insights-grid-avg">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`insight-card-avg ${insight.type}`}>
                            <div className="insight-icon-avg">{insight.icon}</div>
                            <p className="insight-text-avg">{insight.text}</p>
                        </div>
                    ))}
                </div>
            </motion.div>



            {/* Charts */}
            <div className="charts-section-avg">
                <h2 className="section-title-avg">Price Visualizations</h2>
                <div className="charts-grid-avg">
                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="chart-header-avg">
                            <BarChart3 size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Avg Price by Category</h3>
                                <p className="chart-subtitle-avg">Category comparison</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <Bar data={avgPriceByCategoryData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <div className="chart-header-avg">
                            <PieChart size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Highest vs Lowest Price</h3>
                                <p className="chart-subtitle-avg">Price extremes</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <Doughnut data={highLowData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="chart-header-avg">
                            <TrendingUp size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Product Pricing Trend</h3>
                                <p className="chart-subtitle-avg">Over time</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <Line data={priceTrendData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                    >
                        <div className="chart-header-avg">
                            <BarChart3 size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Price Distribution</h3>
                                <p className="chart-subtitle-avg">By price range</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <Bar data={priceDistributionData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                    >
                        <div className="chart-header-avg">
                            <DollarSign size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Revenue by Price Range</h3>
                                <p className="chart-subtitle-avg">Sales distribution</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <PolarArea data={revenueByPriceData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="chart-card-avg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                    >
                        <div className="chart-header-avg">
                            <TrendingUp size={20} className="chart-icon-avg" />
                            <div>
                                <h3 className="chart-title-avg">Profit Margin by Product</h3>
                                <p className="chart-subtitle-avg">Top 10 products</p>
                            </div>
                        </div>
                        <div className="chart-body-avg">
                            <Radar data={profitMarginData} options={radarOptions} />
                        </div>
                    </motion.div>
                </div>
            </div>
            {/* Filters */}
            <motion.div
                className="filters-section-avg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <div className="filter-group-avg">
                    <Filter size={18} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="desc">Price: High to Low</option>
                        <option value="asc">Price: Low to High</option>
                    </select>
                </div>

                <div className="price-range-filter">
                    <label>Price Range: Rs {minPrice} - Rs {maxPrice}</label>
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                </div>
            </motion.div>
            {/* Pricing Table */}
            <motion.div
                className="table-section-avg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
            >
                <h2 className="section-title-avg">Pricing Analysis Table</h2>
                <div className="table-wrapper-avg">
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Cost</th>
                                <th>Selling Price</th>
                                <th>Profit</th>
                                <th>Profit %</th>
                                <th>Stock Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((p) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.05)" }}
                                >
                                    <td className="product-name-cell-avg">{p.name}</td>
                                    <td>Rs {Number(p.cost).toLocaleString()}</td>
                                    <td>Rs {Number(p.price).toLocaleString()}</td>
                                    <td className={`profit-cell-avg ${p.profit >= 0 ? "positive" : "negative"}`}>
                                        Rs {(Number(p.price) - Number(p.cost)).toLocaleString()}
                                    </td>
                                    <td className={p.profitPercent >= 30 ? "good-margin" : p.profitPercent >= 15 ? "ok-margin" : "low-margin"}>
                                        {p.profitPercent.toFixed(1)}%
                                    </td>
                                    <td className="stock-value-cell">Rs {p.stockValue.toLocaleString()}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}