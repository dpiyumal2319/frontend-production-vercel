export default function Loading() {

    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="loading-wave">
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
            </div>
        </div>
    );
}