export default function ProgressBar({ progress }) {
    return (
        <div className="flex items-center justify-center w-full px-4 py-3 text-white text-[10px] font-semibold rounded-2xl bg-white/5 backdrop-blur-lg">
            Progress
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mx-2">
                <div className="h-full rounded-3xl bg-gradient-to-r from-violet via-teal to-light-green transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>
            {progress}%
        </div>
    );
}