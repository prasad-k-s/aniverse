export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <p className="text-muted-foreground mx-auto max-w-7xl px-4 text-center text-sm sm:px-6">
        © {new Date().getFullYear()} AniVerse. Anime data from{' '}
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground underline underline-offset-4"
        >
          AniList
        </a>
        .
      </p>
    </footer>
  )
}
