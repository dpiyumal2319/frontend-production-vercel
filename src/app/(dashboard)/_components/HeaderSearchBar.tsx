'use client'

import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useEffect, useState} from "react";
import {useDebounce} from "use-debounce";
import {SearchResult} from "../global-assets/lookup/_utils/definitions";
import {searchYahooFinance} from "@/app/(dashboard)/global-assets/lookup/_utils/actions";
import {Popover} from "@radix-ui/react-popover";
import {PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Input} from "@/components/ui/input";
import {Loader2, Search, X} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";

function HeaderSearchBar({className = ''}: { className?: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Get the first value from the array returned by useDebounce
    const [debouncedQuery] = useDebounce(searchQuery, 1000);

    // Function to fetch search results
    const fetchSearchResults = async (query: string) => {
        if (query.length < 2) {
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await searchYahooFinance({
                query,
                newsCount: 3,
                quoteCount: 4
            });

            if (response.success) {
                setSearchResults(response.data);
                setIsOpen(true);
            } else {
                setError(response.error);
                setSearchResults(null);
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
            setSearchResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchSearchResults(debouncedQuery).then();
        } else {
            setIsOpen(false);
        }
    }, [debouncedQuery]);

    // Handle view all results click
    const handleViewAllResults = () => {
        if (searchQuery) {
            router.push(`/global-assets/lookup?query=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setIsOpen(false);
    }

    return (
        <div className={`relative ${className}`}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search stocks..."
                            className="w-full h-9 pl-9 pr-8 text-sm focus-visible:ring-1"
                        />
                        {isLoading ? (
                            <Loader2
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin"/>
                        ) : (
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                        )}
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                onClick={handleClearSearch}
                            >
                                <X className="h-3 w-3 text-gray-400"/>
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[320px] md:w-[400px] p-0 max-h-[60vh] overflow-auto"
                    align="end"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <ScrollArea>
                        <HeaderSearchResults
                            data={searchResults}
                            error={error}
                            onViewAllResults={handleViewAllResults}
                        />
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function HeaderSearchResults({
                                 data,
                                 error,
                                 onViewAllResults
                             }: {
    data: SearchResult | null;
    error: string | null;
    onViewAllResults: () => void;
}) {
    if (error) {
        return (
            <div className="p-3 text-xs text-destructive bg-destructive/10">
                Error fetching results: {error}
            </div>
        );
    }

    const {quotes = [], news = []} = data || {};
    const hasResults = quotes.length > 0 || news.length > 0;

    if (!hasResults) {
        return (
            <div className="p-3 text-center text-xs text-muted-foreground">
                No results found. Try a different search term.
            </div>
        );
    }

    return (
        <div className="p-3 space-y-3">
            {/* Quotes Section */}
            {quotes.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">Stocks & Companies</h3>
                    <div className="space-y-1">
                        {quotes.map((quote) => (
                            <Link
                                href={`/assets/${quote.symbol}`}
                                key={quote.symbol}
                                className="flex items-center justify-between p-1.5 hover:bg-muted rounded-sm transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-primary text-xs">{quote.symbol}</span>
                                    <span className="text-xs truncate max-w-[150px]">{quote.shortName || 'N/A'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {quote.exchange || 'N/A'}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* News Section */}
            {news.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">Latest News</h3>
                    <div className="space-y-2">
                        {news.map((item) => (
                            <Link
                                href={item.link}
                                key={item.uuid}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-1.5 hover:bg-muted rounded-sm transition-colors"
                            >
                                <div className="flex gap-2">
                                    {item.thumbnail && (
                                        <div
                                            className="relative w-10 h-10 flex-shrink-0 bg-muted rounded overflow-hidden">
                                            <Image
                                                src={item.thumbnail}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs line-clamp-2">{item.title}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-muted-foreground">{item.publisher}</span>
                                            {item.relatedTickers && item.relatedTickers.length > 0 && (
                                                <div className="flex gap-1">
                                                    {item.relatedTickers.slice(0, 1).map((ticker) => (
                                                        <Badge key={ticker} variant="outline"
                                                               className="text-xs px-1 py-0 h-4">
                                                            {ticker}
                                                        </Badge>
                                                    ))}
                                                    {item.relatedTickers.length > 1 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{item.relatedTickers.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* View all results link */}
            <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-2">
                <button
                    onClick={onViewAllResults}
                    className="text-xs text-primary hover:underline p-1.5"
                >
                    View all results
                </button>
            </div>
        </div>
    );
}

export default HeaderSearchBar;