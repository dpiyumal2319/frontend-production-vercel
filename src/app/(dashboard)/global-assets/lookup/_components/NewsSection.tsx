// ----- News Section Component ----- //
import Link from "next/link";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Image from "next/image";
import {NewsResponse} from "../_utils/definitions";

function NewsSection({news, error}: { news: NewsResponse[]; error: string | null }) {
    if (error) {
        return (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                Error loading news: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">News</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.length > 0 ? (
                    news.map((item) => (
                        <NewsCard key={item.uuid} newsItem={item}/>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-6 text-muted-foreground">
                        No news found for this search
                    </div>
                )}
            </div>
        </div>
    );
}

// ----- News Card Component ----- //
function NewsCard({newsItem}: { newsItem: NewsResponse }) {
    // Format the date if available
    const formattedDate = newsItem.providerPublishedTime
        ? new Date(newsItem.providerPublishedTime).toLocaleString()
        : null;

    return (
        <Link href={newsItem.link} target="_blank" rel="noopener noreferrer">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Content column */}
                        <div className="sm:w-2/3 flex flex-col justify-between">
                            <div className="space-y-2">
                                {/* Add a subtitle or excerpt here if available */}
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {newsItem.title}
                                </p>
                            </div>

                            <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                                {newsItem.publisher && <span className="font-medium">{newsItem.publisher}</span>}
                                {formattedDate && <span>{formattedDate}</span>}
                            </div>
                        </div>
                        {/* Image column */}
                        {newsItem.thumbnail && (
                            <div
                                className="relative sm:w-1/3 h-24 sm:h-auto bg-muted rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                    src={newsItem.thumbnail}
                                    alt={newsItem.title}
                                    className="object-cover"
                                    fill
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>

                {newsItem.relatedTickers && newsItem.relatedTickers.length > 0 && (
                    <CardFooter className="flex flex-wrap gap-2">
                        {newsItem.relatedTickers.map((ticker: string) => (
                            <Link key={ticker} href={`/assets/${ticker}`}>
                                <Badge className="bg-primary/10 cursor-pointer" variant="outline">
                                    {ticker}
                                </Badge>
                            </Link>
                        ))}
                    </CardFooter>
                )}
            </Card>
        </Link>
    );
}

export default NewsSection;