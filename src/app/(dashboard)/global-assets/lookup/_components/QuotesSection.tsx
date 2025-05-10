import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {QuoteResponse} from "../_utils/definitions";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";

// ----- Quotes Section Component ----- //
function QuotesSection({quotes, error}: { quotes: QuoteResponse[]; error: string | null }) {
    if (error) {
        return (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                Error loading quotes: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quotes</h2>

            <Table>
                <TableHeader>
                    <TableRow className="bg-primary/10">
                        <TableHead className="w-[100px]">Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Exchange</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Industry</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.length > 0 ? (
                        quotes.map((quote) => (
                            <TableRow key={quote.symbol} className="hover:bg-muted/50">
                                <TableCell className="font-bold text-primary">
                                    <Link href={`/assets/${quote.symbol}`}>
                                        <Badge className="bg-primary/10 cursor-pointer" variant="outline">
                                            {quote.symbol}
                                        </Badge>
                                    </Link>
                                </TableCell>
                                <TableCell className="max-w-[150px] truncate" title={quote.shortName || 'N/A'}>
                                    {quote.shortName || 'N/A'}
                                </TableCell>
                                <TableCell>{quote.exchange || 'N/A'}</TableCell>
                                <TableCell>{quote.quoteType || 'N/A'}</TableCell>
                                <TableCell>
                                    {quote.sectorDisplay || quote.sector || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {quote.industryDisplay || quote.industry || 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                No quotes found for this search
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default QuotesSection;