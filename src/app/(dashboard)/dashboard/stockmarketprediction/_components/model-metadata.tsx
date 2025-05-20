import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {ModelMetadataType} from "@/lib/types/stock_prediction";

interface ModelMetadataProps {
  metadata: ModelMetadataType
}

export default function ModelMetadata({ metadata }: ModelMetadataProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Details about the prediction model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Model Type</p>
              <p className="text-lg font-semibold">{metadata.modelType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">{metadata.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trained On</p>
              <p className="text-lg font-semibold">{format(new Date(metadata.trainedOn), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-lg font-semibold">{format(new Date(metadata.lastUpdated), "MMM dd, yyyy")}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Training Data Points</p>
            <p className="text-lg font-semibold">{metadata.trainingDataPoints.toLocaleString()}</p>
          </div>
          <div>
            {/* <p className="text-sm font-medium text-muted-foreground mb-2">Features Used</p> */}
            {/* <div className="flex flex-wrap gap-2">
              {metadata.features.map((feature, index) => (
                <div key={index} className="rounded-full bg-muted px-3 py-1 text-xs">
                  {feature}
                </div>
              ))}
            </div> */}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>error metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Accuracy</p>
              <p className="text-sm font-medium">{metadata.accuracy}%</p>
            </div>
            <Progress value={metadata.accuracy} className="h-2" />
          </div> */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Mean Absolute Error (MAE)</p>
              <p className="text-sm font-medium">{metadata.maeScore.toFixed(5)}</p>
            </div>
            {/* <Progress value={100 - metadata.maeScore * 10} className="h-2" /> */}
            <p className="text-xs text-muted-foreground mt-1">Average error in price predictions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
