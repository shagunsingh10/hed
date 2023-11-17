import logging

from rich.logging import RichHandler

# from rich.traceback import install
# install(show_locals=True)


def get_logger(name: str = None):
    FORMAT = "%(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=FORMAT,
        datefmt="[%Y-%m-%d %H:%M:%S]",
        handlers=[RichHandler()],
    )
    logger = logging.getLogger(name)
    return logger
