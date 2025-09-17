import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cosmicFind } from "../../cosmic";
import Poll from "../../components/Poll";

export default function PollGroupDetail() {
    const { pollId } = useParams();
    const [pollGroup, setPollGroup] = useState(null);
    const [csvUrl, setCsvUrl] = useState(null);

    useEffect(() => {
        (async () => {
            const pollGroupRecv = (await cosmicFind({ type: "poll-groups", slug: pollId }))[0];

            setPollGroup(pollGroupRecv);

            const csvBlob = new Blob([pollGroupRecv.csv_data], { type: "text/csv" });
            setCsvUrl(URL.createObjectURL(csvBlob));
        })();

        return () => {
            if (csvUrl) {
                URL.revokeObjectURL(csvUrl);
            }
        };
    }, [csvUrl, pollId]);

    if (!pollGroup) return;
    return (
        <div className="container mx-auto py-10 px-4 text-center">
            <h2 className="text-5xl font-bold mb-6 text-red-500">{pollGroup.title} Poll</h2>

            <div className="mb-6 max-w-4xl mx-auto">
                <a
                    href={csvUrl}
                    download={`BOP ${pollGroup.title}.csv`}
                    className="block w-full bg-gray-800 text-white uppercase font-bold py-4 rounded-lg hover:bg-gray-700 transition text-xl text-center"
                >
                    Download Full Results
                </a>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-6xl mx-auto">
                {JSON.parse(pollGroup.data).map((chartData, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md" style={{ paddingTop: "10px", paddingLeft: "10px", paddingRight: "10px" }}>
                        <Poll data={chartData} tag={`${pollGroup.title} #${index + 1}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}
