import logging
import structlog

structlog.configure(
    processors=[
        # Prepare event dict for `ProcessorFormatter`.
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
)

formatter = structlog.stdlib.ProcessorFormatter(
    processors=[structlog.dev.ConsoleRenderer()],
)

handler = logging.StreamHandler()
handler.setFormatter(formatter)


def get_logger(name: str = None):
    root_logger = logging.getLogger(name)
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)
    return root_logger
